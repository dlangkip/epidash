<?php
// Start session for potential user management features
session_start();

// Page title
$page_title = "Epidemiological Data Dashboard";

// Include header
include_once './includes/header.php';
?>

<div class="dashboard-container">
    <!-- Sidebar with filters -->
    <?php include_once './includes/sidebar.php'; ?>

    <main class="main-content">
        <div class="dashboard-header">
            <h1><?php echo $page_title; ?></h1>
            <div class="date-range-selector">
                <label for="start-date">From:</label>
                <input type="date" id="start-date" name="start-date" value="2023-01-01">
                <label for="end-date">To:</label>
                <input type="date" id="end-date" name="end-date" value="2023-12-31">
                <button id="update-dashboard" class="btn-primary">Update</button>
            </div>
        </div>

        <!-- Key metrics cards -->
        <div class="metrics-container">
            <div class="metric-card" id="total-cases">
                <h3>Total Cases</h3>
                <div class="metric-value">Loading...</div>
                <div class="metric-change positive">
                    <span class="change-indicator">▲</span> <span class="change-value">0%</span>
                </div>
            </div>
            <div class="metric-card" id="active-cases">
                <h3>Active Cases</h3>
                <div class="metric-value">Loading...</div>
                <div class="metric-change negative">
                    <span class="change-indicator">▼</span> <span class="change-value">0%</span>
                </div>
            </div>
            <div class="metric-card" id="recovery-rate">
                <h3>Recovery Rate</h3>
                <div class="metric-value">Loading...</div>
                <div class="metric-change positive">
                    <span class="change-indicator">▲</span> <span class="change-value">0%</span>
                </div>
            </div>
            <div class="metric-card" id="mortality-rate">
                <h3>Mortality Rate</h3>
                <div class="metric-value">Loading...</div>
                <div class="metric-change">
                    <span class="change-indicator">–</span> <span class="change-value">0%</span>
                </div>
            </div>
        </div>

        <!-- Charts and visualizations -->
        <div class="visualizations-grid">
            <div class="chart-container">
                <h2>Disease Trends</h2>
                <div class="chart-wrapper">
                    <canvas id="trends-chart"></canvas>
                </div>
            </div>
            <div class="chart-container">
                <h2>Regional Distribution</h2>
                <div class="chart-wrapper">
                    <canvas id="region-chart"></canvas>
                </div>
            </div>
            <div class="chart-container full-width">
                <h2>Geographic Prevalence</h2>
                <div class="map-wrapper" id="disease-map"></div>
            </div>
            <div class="chart-container">
                <h2>Age Distribution</h2>
                <div class="chart-wrapper">
                    <canvas id="age-chart"></canvas>
                </div>
            </div>
            <div class="chart-container">
                <h2>Recovery Timeline</h2>
                <div class="chart-wrapper">
                    <canvas id="recovery-chart"></canvas>
                </div>
            </div>
        </div>

        <!-- Data table section -->
        <div class="data-table-section">
            <div class="table-header">
                <h2>Detailed Data</h2>
                <div class="table-controls">
                    <input type="text" id="table-search" placeholder="Search data...">
                    <button id="export-data" class="btn-secondary">Export CSV</button>
                </div>
            </div>
            <div class="table-wrapper">
                <table id="data-table">
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Disease</th>
                            <th>Date</th>
                            <th>Cases</th>
                            <th>Recoveries</th>
                            <th>Deaths</th>
                            <th>Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="7" class="loading-data">Loading data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                <button id="prev-page" disabled>Previous</button>
                <span id="page-indicator">Page 1 of 1</span>
                <button id="next-page" disabled>Next</button>
            </div>
        </div>
    </main>
</div>

<!-- Data loading animation overlay -->
<div id="loading-overlay">
    <div class="spinner"></div>
    <p>Loading dashboard data...</p>
</div>

<!-- Include footer -->
<?php include_once './includes/footer.php'; ?>

<!-- Initialize dashboard -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize the dashboard when page is fully loaded
        initializeDashboard();
    });
</script>