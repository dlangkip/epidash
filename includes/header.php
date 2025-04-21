<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? $page_title : 'Epidemiological Data Dashboard'; ?></title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="./assets/img/favicon.svg">
    
    <!-- CSS Stylesheets -->
    <link rel="stylesheet" href="./assets/css/style.css">
    <link rel="stylesheet" href="./assets/css/dashboard.css">
    
    <!-- Chart.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    
    <!-- Leaflet for map visualization -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.js"></script>
    
    <!-- Custom JavaScript -->
    <script src="./assets/js/main.js" defer></script>
    <script src="./assets/js/charts.js" defer></script>
    <script src="./assets/js/map.js" defer></script>
    <script src="./assets/js/filters.js" defer></script>
</head>
<body>
    <header class="main-header">
        <div class="logo">
            <img src="./assets/img/logo.svg" alt="Dashboard Logo">
            <span>EpiDash</span>
        </div>
        <nav class="main-nav">
            <ul>
                <li><a href="index.php" class="active">Dashboard</a></li>
                <li><a href="#">Reports</a></li>
                <li><a href="#">Analytics</a></li>
                <li><a href="#">Settings</a></li>
            </ul>
        </nav>
        <div class="user-actions">
            <div class="data-source-selector">
                <select id="data-source-select" title="Select Data Source">
                    <option value="mock">Mock Data</option>
                    <option value="database">Database</option>
                    <option value="both">Both Sources</option>
                </select>
            </div>
            <button class="btn-secondary">Help</button>
            <div class="user-profile">
                <img src="./assets/img/user-avatar.svg" alt="User Avatar">
                <span>User</span>
            </div>
        </div>
    </header>
    <div class="content-wrapper">