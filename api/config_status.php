<?php
/**
 * EpiDash - Epidemiological Data Dashboard
 * config_status.php - Exposes configuration settings to the frontend
 */

// Include configuration
require_once 'config.php';

// Set headers
header('Content-Type: application/json');

// Enable CORS if configured
if (defined('ENABLE_CORS') && ENABLE_CORS) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

// Create configuration object with only the settings that should be exposed to the frontend
$configStatus = [
    'defaultDataSource' => defined('DEFAULT_DATA_SOURCE') ? DEFAULT_DATA_SOURCE : 'mock',
    'allowSourceSwitching' => defined('ALLOW_SOURCE_SWITCHING') ? ALLOW_SOURCE_SWITCHING : false,
    'availableSources' => ['mock', 'database', 'both'],
    'version' => defined('APP_VERSION') ? APP_VERSION : '1.0.0',
    'appName' => defined('APP_NAME') ? APP_NAME : 'EpiDash'
];

// Return configuration
echo json_encode($configStatus);