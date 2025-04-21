<?php
/**
 * EpiDash - Epidemiological Data Dashboard
 * disease_data.php - Sample disease data generation
 */

// Include region data
require_once 'regions.php';

/**
 * Generate disease data for demonstration purposes
 * 
 * @param int $count Number of records to generate
 * @return array Generated disease data
 */
function generateDiseaseData($count = 1000) {
    global $regions;
    
    $data = [];
    
    // Diseases with realistic prevalence weightings
    $diseases = [
        'Malaria' => [
            'weight' => 35,
            'recovery_rate' => 97, // 97% recovery rate
            'mortality_rate' => 0.3, // 0.3% mortality rate
            'seasonal' => true,
            'peak_months' => [4, 5, 6, 10, 11] // Apr, May, Jun, Oct, Nov (rainy seasons)
        ],
        'Tuberculosis' => [
            'weight' => 15,
            'recovery_rate' => 85,
            'mortality_rate' => 8,
            'seasonal' => false,
            'peak_months' => []
        ],
        'Cholera' => [
            'weight' => 10,
            'recovery_rate' => 99,
            'mortality_rate' => 0.2,
            'seasonal' => true,
            'peak_months' => [3, 4, 5, 10, 11, 12] // Mar-May, Oct-Dec (rainy seasons)
        ],
        'Dengue Fever' => [
            'weight' => 5,
            'recovery_rate' => 99.5,
            'mortality_rate' => 0.1,
            'seasonal' => true,
            'peak_months' => [4, 5, 6, 10, 11] // Apr, May, Jun, Oct, Nov (rainy seasons)
        ],
        'Typhoid' => [
            'weight' => 20,
            'recovery_rate' => 99,
            'mortality_rate' => 0.2,
            'seasonal' => false,
            'peak_months' => []
        ],
        'HIV/AIDS' => [
            'weight' => 15,
            'recovery_rate' => 0, // Chronic condition
            'mortality_rate' => 5,
            'seasonal' => false,
            'peak_months' => []
        ]
    ];
    
    // Age groups with weightings
    $ageGroups = [
        '0-14' => 30,
        '15-24' => 25,
        '25-44' => 25,
        '45-64' => 15,
        '65+' => 5
    ];
    
    // Region-specific disease weightings (some diseases are more prevalent in certain regions)
    $regionDiseaseWeights = [
        // Coastal regions have higher malaria and dengue
        'MOM' => ['Malaria' => 45, 'Dengue Fever' => 15],
        'KWL' => ['Malaria' => 50, 'Dengue Fever' => 10],
        'KLF' => ['Malaria' => 50, 'Dengue Fever' => 10],
        'LAM' => ['Malaria' => 50, 'Dengue Fever' => 10],
        
        // Urban areas have higher TB rates
        'NAI' => ['Tuberculosis' => 25, 'HIV/AIDS' => 20],
        'KIS' => ['Tuberculosis' => 20, 'HIV/AIDS' => 20],
        'NAK' => ['Tuberculosis' => 20, 'HIV/AIDS' => 18],
        'UGK' => ['Tuberculosis' => 20]
    ];
    
    // Date range
    $startDate = strtotime('2023-01-01');
    $endDate = strtotime('2023-12-31');
    $dateRange = $endDate - $startDate;
    
    // Generate random data entries
    for ($i = 0; $i < $count; $i++) {
        // Pick random date within range
        $randomTimestamp = mt_rand($startDate, $endDate);
        $date = date('Y-m-d', $randomTimestamp);
        $month = date('n', $randomTimestamp);
        
        // Pick random region
        $regionCode = array_rand($regions);
        $region = $regions[$regionCode];
        
        // Pick disease with weighting
        $disease = weightedRandom($diseases);
        
        // Adjust for regional disease prevalence
        if (isset($regionDiseaseWeights[$regionCode]) && isset($regionDiseaseWeights[$regionCode][$disease])) {
            // If this region has a specific weight for this disease, we're more likely to pick this disease
            if (mt_rand(1, 100) <= $regionDiseaseWeights[$regionCode][$disease]) {
                // Keep the disease
            } else {
                // Pick another disease
                $disease = weightedRandom($diseases);
            }
        }
        
        // Adjust for seasonal patterns
        $diseaseInfo = $diseases[$disease];
        if ($diseaseInfo['seasonal'] && !in_array($month, $diseaseInfo['peak_months'])) {
            // Outside peak season, reduce case numbers
            if (mt_rand(1, 100) > 30) {
                // 70% chance to pick another date/disease during non-peak
                continue;
            }
        }
        
        // Pick age group with weighting
        $ageGroup = weightedRandom($ageGroups);
        
        // Pick gender
        $gender = (mt_rand(0, 1) == 0) ? 'male' : 'female';
        
        // Generate cases based on population
        $populationFactor = isset($regionPopulation[$regionCode]) ? $regionPopulation[$regionCode] / 1000000 : 1;
        $baseCases = mt_rand(5, 30);
        $cases = round($baseCases * $populationFactor);
        
        // Apply disease-specific recovery and mortality rates
        $recoveryRate = $diseaseInfo['recovery_rate'] / 100;
        $mortalityRate = $diseaseInfo['mortality_rate'] / 100;
        
        $recoveries = round($cases * $recoveryRate);
        $deaths = round($cases * $mortalityRate);
        
        // Ensure we don't have more recoveries + deaths than cases
        if ($recoveries + $deaths > $cases) {
            $overflow = ($recoveries + $deaths) - $cases;
            $recoveries = max(0, $recoveries - $overflow);
        }
        
        $active = $cases - $recoveries - $deaths;
        
        // Add to data array
        $data[] = [
            'date' => $date,
            'region' => $region,
            'region_code' => $regionCode,
            'disease' => $disease,
            'age_group' => $ageGroup,
            'gender' => $gender,
            'cases' => $cases,
            'recoveries' => $recoveries,
            'deaths' => $deaths,
            'active' => $active
        ];
    }
    
    return $data;
}

/**
 * Helper function to pick a random item with weighting
 * 
 * @param array $items Associative array of items with weights
 * @return string Selected item key
 */
function weightedRandom($items) {
    $weightSum = 0;
    
    // Extract weights
    $weights = [];
    foreach ($items as $item => $info) {
        $weight = is_array($info) ? $info['weight'] : $info;
        $weights[$item] = $weight;
        $weightSum += $weight;
    }
    
    // Generate random number
    $randNum = mt_rand(1, $weightSum);
    
    // Find the item that corresponds to the random number
    $sum = 0;
    foreach ($weights as $item => $weight) {
        $sum += $weight;
        if ($randNum <= $sum) {
            return $item;
        }
    }
    
    // Fallback (should not reach here)
    return array_key_first($items);
}

// Generate and return data when this file is accessed directly
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    header('Content-Type: application/json');
    echo json_encode(generateDiseaseData(1000));
}
