<?php
/**
 * EpiDash - Epidemiological Data Dashboard
 * process_data.php - Data processing functions
 */

/**
 * Group data by a specific field
 * 
 * @param array $data Data to group
 * @param string $groupBy Field to group by
 * @return array Grouped data
 */
function groupDataBy($data, $groupBy) {
    $result = [];
    
    foreach ($data as $item) {
        $key = $item[$groupBy];
        
        if (!isset($result[$key])) {
            $result[$key] = [
                'cases' => 0,
                'recoveries' => 0,
                'deaths' => 0,
                'active' => 0,
                'count' => 0
            ];
        }
        
        $result[$key]['cases'] += $item['cases'];
        $result[$key]['recoveries'] += $item['recoveries'];
        $result[$key]['deaths'] += $item['deaths'];
        $result[$key]['active'] += $item['active'];
        $result[$key]['count']++;
    }
    
    return $result;
}

/**
 * Group data by time period
 * 
 * @param array $data Data to group
 * @param string $period Period type ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
 * @return array Grouped data
 */
function groupDataByTimePeriod($data, $period = 'daily') {
    if ($period === 'daily') {
        return $data;
    }
    
    $result = [];
    
    foreach ($data as $item) {
        $date = new DateTime($item['date']);
        $groupKey = '';
        
        // Determine the appropriate group key based on the period
        switch ($period) {
            case 'weekly':
                $weekNumber = $date->format('W');
                $year = $date->format('Y');
                $groupKey = $year . '-W' . $weekNumber;
                break;
                
            case 'monthly':
                $groupKey = $date->format('Y-m');
                break;
                
            case 'quarterly':
                $month = (int)$date->format('m');
                $quarter = ceil($month / 3);
                $year = $date->format('Y');
                $groupKey = $year . '-Q' . $quarter;
                break;
                
            case 'yearly':
                $groupKey = $date->format('Y');
                break;
                
            default:
                $groupKey = $item['date'];
                break;
        }
        
        if (!isset($result[$groupKey])) {
            // Initialize with a copy of the first item in this group
            $result[$groupKey] = [
                'display_date' => $groupKey,
                'region' => $item['region'],
                'disease' => $item['disease'],
                'age_group' => $item['age_group'],
                'gender' => $item['gender'],
                'cases' => 0,
                'recoveries' => 0,
                'deaths' => 0,
                'active' => 0,
                'date' => $item['date'] // Use first date in group
            ];
        }
        
        // Accumulate values
        $result[$groupKey]['cases'] += $item['cases'];
        $result[$groupKey]['recoveries'] += $item['recoveries'];
        $result[$groupKey]['deaths'] += $item['deaths'];
        $result[$groupKey]['active'] += $item['active'];
    }
    
    // Convert to indexed array
    return array_values($result);
}

/**
 * Calculate metrics from data
 * 
 * @param array $data Data to analyze
 * @return array Calculated metrics
 */
function calculateMetrics($data) {
    $metrics = [
        'total_cases' => 0,
        'total_recoveries' => 0,
        'total_deaths' => 0,
        'total_active' => 0,
        'recovery_rate' => 0,
        'mortality_rate' => 0,
        'highest_region' => '',
        'highest_disease' => '',
        'trend' => 'stable'
    ];
    
    if (empty($data)) {
        return $metrics;
    }
    
    // Calculate totals
    foreach ($data as $item) {
        $metrics['total_cases'] += $item['cases'];
        $metrics['total_recoveries'] += $item['recoveries'];
        $metrics['total_deaths'] += $item['deaths'];
        $metrics['total_active'] += $item['active'];
    }
    
    // Calculate rates
    if ($metrics['total_cases'] > 0) {
        $metrics['recovery_rate'] = round(($metrics['total_recoveries'] / $metrics['total_cases']) * 100, 2);
        $metrics['mortality_rate'] = round(($metrics['total_deaths'] / $metrics['total_cases']) * 100, 2);
    }
    
    // Find highest incidence by region
    $regionCases = [];
    foreach ($data as $item) {
        if (!isset($regionCases[$item['region']])) {
            $regionCases[$item['region']] = 0;
        }
        $regionCases[$item['region']] += $item['cases'];
    }
    
    if (!empty($regionCases)) {
        $metrics['highest_region'] = array_keys($regionCases, max($regionCases))[0];
    }
    
    // Find highest incidence by disease
    $diseaseCases = [];
    foreach ($data as $item) {
        if (!isset($diseaseCases[$item['disease']])) {
            $diseaseCases[$item['disease']] = 0;
        }
        $diseaseCases[$item['disease']] += $item['cases'];
    }
    
    if (!empty($diseaseCases)) {
        $metrics['highest_disease'] = array_keys($diseaseCases, max($diseaseCases))[0];
    }
    
    // Determine trend
    if (count($data) > 1) {
        // Sort by date
        usort($data, function($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });
        
        // Split into two halves
        $count = count($data);
        $firstHalf = array_slice($data, 0, floor($count / 2));
        $secondHalf = array_slice($data, floor($count / 2));
        
        // Calculate average cases per period for each half
        $firstHalfAvg = array_sum(array_column($firstHalf, 'cases')) / count($firstHalf);
        $secondHalfAvg = array_sum(array_column($secondHalf, 'cases')) / count($secondHalf);
        
        // Calculate percentage change
        $percentChange = ($secondHalfAvg - $firstHalfAvg) / ($firstHalfAvg ?: 1) * 100;
        
        // Determine trend direction
        if ($percentChange > 10) {
            $metrics['trend'] = 'increasing';
        } elseif ($percentChange < -10) {
            $metrics['trend'] = 'decreasing';
        } else {
            $metrics['trend'] = 'stable';
        }
    }
    
    return $metrics;
}

/**
 * Apply filters to data
 * 
 * @param array $data Data to filter
 * @param array $filters Filter criteria
 * @return array Filtered data
 */
function applyFilters($data, $filters) {
    $result = [];
    
    foreach ($data as $item) {
        $include = true;
        
        // Date range filter
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            if ($item['date'] < $filters['start_date'] || $item['date'] > $filters['end_date']) {
                $include = false;
            }
        }
        
        // Disease filter
        if (isset($filters['disease']) && $filters['disease'] !== 'all') {
            if ($item['disease'] !== $filters['disease']) {
                $include = false;
            }
        }
        
        // Region filter
        if (isset($filters['region']) && $filters['region'] !== 'all') {
            if ($item['region'] !== $filters['region']) {
                $include = false;
            }
        }
        
        // Age group filter
        if (isset($filters['age_groups']) && !empty($filters['age_groups'])) {
            if (!in_array($item['age_group'], $filters['age_groups'])) {
                $include = false;
            }
        }
        
        // Gender filter
        if (isset($filters['gender']) && $filters['gender'] !== 'all') {
            if ($item['gender'] !== $filters['gender']) {
                $include = false;
            }
        }
        
        if ($include) {
            $result[] = $item;
        }
    }
    
    return $result;
}

/**
 * Sanitize output data for JSON
 * 
 * @param array $data Data to sanitize
 * @return array Sanitized data
 */
function sanitizeOutput($data) {
    array_walk_recursive($data, function(&$value) {
        // Convert numeric strings to actual numbers
        if (is_string($value) && is_numeric($value)) {
            $value = $value + 0; // Convert to int or float based on value
        }
        
        // Ensure no special characters in string values
        if (is_string($value)) {
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
    });
    
    return $data;
}