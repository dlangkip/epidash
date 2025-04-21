<?php
/**
 * EpiDash - Epidemiological Data Dashboard
 * config.php - Database and API configuration
 */

// Load environment variables from .env file
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        } elseif (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        }
        
        putenv("$name=$value");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

// Helper function to get environment variables with fallbacks
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    return $value;
}

// Database configuration
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', 'epidash'));
define('DB_USER', env('DB_USER', ''));
define('DB_PASS', env('DB_PASS', ''));

// App settings
define('APP_NAME', env('APP_NAME', 'EpiDash'));
define('APP_VERSION', env('APP_VERSION', '1.0.0'));
define('APP_AUTHOR', env('APP_AUTHOR', 'Kiprotich')); 

// Date settings
define('DEFAULT_START_DATE', env('DEFAULT_START_DATE', '2023-01-01'));
define('DEFAULT_END_DATE', env('DEFAULT_END_DATE', '2023-12-31'));

// API settings
define('DATA_SOURCE', env('DATA_SOURCE', 'mock')); // Options: 'mock', 'database', or 'both'
define('DEFAULT_DATA_SOURCE', env('DEFAULT_DATA_SOURCE', 'mock')); // Default data source if not specified
define('ALLOW_SOURCE_SWITCHING', env('ALLOW_SOURCE_SWITCHING', true) === 'true'); // Allow users to switch between data sources
define('API_CACHE_DURATION', intval(env('API_CACHE_DURATION', 3600))); // Cache API responses for 1 hour

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', env('DISPLAY_ERRORS', 1));

// Timezone
date_default_timezone_set(env('TIMEZONE', 'Africa/Nairobi'));

// Security
define('ENABLE_CORS', env('ENABLE_CORS', true) === 'true');
define('CSRF_PROTECTION', env('CSRF_PROTECTION', true) === 'true');