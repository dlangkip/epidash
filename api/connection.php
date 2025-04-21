<?php
/**
 * EpiDash - Epidemiological Data Dashboard
 * connection.php - Database connection handler
 */

// Include configuration
require_once 'config.php';

/**
 * Get database connection
 * 
 * @return PDO|null Database connection
 */
function getConnection() {
    try {
        // Create PDO connection
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
            DB_USER,
            DB_PASS,
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        );
        
        return $conn;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

/**
 * Execute a query and return results
 * 
 * @param string $query SQL query
 * @param array $params Query parameters
 * @return array|false Query results or false on failure
 */
function executeQuery($query, $params = []) {
    try {
        $conn = getConnection();
        
        if (!$conn) {
            throw new Exception("Could not establish database connection");
        }
        
        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Query execution failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Generate fake epidemiological data when USE_MOCK_DATA is enabled
 * 
 * @param int $count Number of records to generate
 * @return array Generated mock data
 */
function generateMockData($count = 1000) {
    $data = [];
    
    // Sample regions (Kenyan counties)
    $regions = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
        'Machakos', 'Kiambu', 'Kajiado', 'Kilifi', 'Nyeri',
        'Kakamega', 'Bungoma', 'Meru', 'Embu', 'Garissa'
    ];
    
    // Sample diseases
    $diseases = [
        'Malaria', 'Tuberculosis', 'Cholera', 'Dengue Fever', 'Typhoid'
    ];
    
    // Age groups
    $ageGroups = ['0-14', '15-24', '25-44', '45-64', '65+'];
    
    // Gender
    $genders = ['male', 'female'];
    
    // Start and end dates
    $startDate = strtotime(DEFAULT_START_DATE);
    $endDate = strtotime(DEFAULT_END_DATE);
    
    // Generate random data entries
    for ($i = 0; $i < $count; $i++) {
        // Pick random date within range
        $randomTimestamp = mt_rand($startDate, $endDate);
        $date = date('Y-m-d', $randomTimestamp);
        
        // Pick random region, disease, age group, and gender
        $region = $regions[array_rand($regions)];
        $disease = $diseases[array_rand($diseases)];
        $ageGroup = $ageGroups[array_rand($ageGroups)];
        $gender = $genders[array_rand($genders)];
        
        // Generate cases, recoveries, deaths, and active cases
        $cases = mt_rand(5, 200);
        $recoveries = mt_rand(1, $cases - 2);
        $deaths = mt_rand(0, $cases - $recoveries);
        $active = $cases - $recoveries - $deaths;
        
        // Add to data array
        $data[] = [
            'date' => $date,
            'region' => $region,
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