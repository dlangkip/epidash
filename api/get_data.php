<?php
/**
 * EpiDash - Epidemiological Data Dashboard
 * get_data.php - API endpoint to fetch epidemiological data
 */

// Include necessary files
require_once 'config.php';
require_once 'connection.php';
require_once 'process_data.php';

// Set headers
header('Content-Type: application/json');

// Enable CORS if configured
if (defined('ENABLE_CORS') && ENABLE_CORS) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Check if this is a preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

// Process request parameters
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : DEFAULT_START_DATE;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : DEFAULT_END_DATE;
$disease = isset($_GET['disease']) ? $_GET['disease'] : null;
$region = isset($_GET['region']) ? $_GET['region'] : null;
$dataSource = isset($_GET['source']) ? $_GET['source'] : DEFAULT_DATA_SOURCE;

// Check if data source switching is allowed
if (!ALLOW_SOURCE_SWITCHING) {
    $dataSource = DEFAULT_DATA_SOURCE;
}

// Validate data source
if (!in_array($dataSource, ['mock', 'database', 'both'])) {
    $dataSource = DEFAULT_DATA_SOURCE;
}

// Validate dates
if (!validateDateFormat($startDate) || !validateDateFormat($endDate)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid date format. Use YYYY-MM-DD']);
    exit;
}

// Handle data fetching based on the selected data source
$responseData = [];

// Get mock data if requested
if ($dataSource === 'mock' || $dataSource === 'both') {
    $mockData = generateMockData(1000);
    
    // Apply filters if provided
    if ($disease || $region || $startDate || $endDate) {
        $mockData = filterMockData($mockData, $startDate, $endDate, $disease, $region);
    }
    
    // If only using mock data, return it directly
    if ($dataSource === 'mock') {
        echo json_encode($mockData);
        exit;
    }
    
    // Otherwise, store for merging
    $responseData['mock'] = $mockData;
}

// Get database data if requested
if ($dataSource === 'database' || $dataSource === 'both') {
    try {
        // Build the query
        $query = "SELECT 
                    ed.data_id,
                    ed.date_recorded as date,
                    r.region_name as region,
                    d.disease_name as disease,
                    ag.age_range as age_group,
                    ed.gender,
                    ed.cases,
                    ed.recoveries,
                    ed.deaths,
                    ed.active
                FROM epidemiological_data ed
                JOIN regions r ON ed.region_code = r.region_code
                JOIN diseases d ON ed.disease_id = d.disease_id
                JOIN age_groups ag ON ed.age_group_id = ag.age_group_id
                WHERE ed.date_recorded BETWEEN :start_date AND :end_date";
        
        $params = [
            ':start_date' => $startDate,
            ':end_date' => $endDate
        ];
        
        // Add disease filter if provided
        if ($disease) {
            $query .= " AND d.disease_name = :disease";
            $params[':disease'] = $disease;
        }
        
        // Add region filter if provided
        if ($region) {
            $query .= " AND r.region_name = :region";
            $params[':region'] = $region;
        }
        
        // Execute the query
        $result = executeQuery($query, $params);
        
        if ($result === false) {
            throw new Exception("Database query failed");
        }
        
        // If only using database, return the result directly
        if ($dataSource === 'database') {
            echo json_encode($result);
            exit;
        }
        
        // Otherwise, store for merging
        $responseData['database'] = $result;
    } catch (Exception $e) {
        // If only using database and it failed, return error
        if ($dataSource === 'database') {
            http_response_code(500); // Internal Server Error
            echo json_encode(['error' => 'Could not fetch epidemiological data: ' . $e->getMessage()]);
            exit;
        }
        
        // If both sources were requested but database failed, log error and continue with mock data
        $responseData['database_error'] = $e->getMessage();
    }
}

// If we get here, we're using 'both' data sources
// Return the combined response or mock data if database failed
echo json_encode($responseData);

/**
 * Validate date format (YYYY-MM-DD)
 * 
 * @param string $date Date string to validate
 * @return bool True if valid, false otherwise
 */
function validateDateFormat($date) {
    $pattern = '/^\d{4}-\d{2}-\d{2}$/';
    if (!preg_match($pattern, $date)) {
        return false;
    }
    
    $dateParts = explode('-', $date);
    return checkdate($dateParts[1], $dateParts[2], $dateParts[0]);
}

/**
 * Filter mock data based on criteria
 * 
 * @param array $data Mock data array
 * @param string $startDate Start date (YYYY-MM-DD)
 * @param string $endDate End date (YYYY-MM-DD)
 * @param string|null $disease Disease to filter by
 * @param string|null $region Region to filter by
 * @return array Filtered data
 */
function filterMockData($data, $startDate, $endDate, $disease = null, $region = null) {
    $filtered = [];
    
    foreach ($data as $item) {
        // Date filter
        if ($item['date'] < $startDate || $item['date'] > $endDate) {
            continue;
        }
        
        // Disease filter
        if ($disease !== null && $item['disease'] !== $disease) {
            continue;
        }
        
        // Region filter
        if ($region !== null && $item['region'] !== $region) {
            continue;
        }
        
        $filtered[] = $item;
    }
    
    return $filtered;
}