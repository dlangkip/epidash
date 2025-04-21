/**
 * EpiDash - Epidemiological Data Dashboard
 * main.js - Core functionality and initialization
 */

// Global dashboard state
const dashboardState = {
    filters: {
        disease: 'all',
        region: 'all',
        ageGroups: ['0-14', '15-24', '25-44', '45-64', '65+'],
        gender: 'all',
        groupBy: 'weekly',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        dataSource: 'mock' // Default data source
    },
    data: {
        raw: null,
        filtered: null,
        metrics: {
            totalCases: 0,
            activeCases: 0,
            recoveryRate: 0,
            mortalityRate: 0
        },
        quickStats: {
            highestIncidence: '',
            mostAffectedRegion: '',
            leastAffectedRegion: '',
            trendDirection: ''
        }
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1
    },
    charts: {
        trends: null,
        region: null,
        map: null,
        age: null,
        recovery: null
    }
};

/**
 * Initialize the dashboard
 */
function initializeDashboard() {
    // Initialize data source selector
    initializeDataSourceSelector();
    
    // Show loading overlay
    showLoadingOverlay();
    
    // Load data from API
    fetchDashboardData()
        .then(data => {
            // Store raw data
            dashboardState.data.raw = data;
            
            // Apply initial filters
            applyFilters();
            
            // Initialize charts and visualizations
            initializeCharts();
            
            // Initialize map
            initializeMap();
            
            // Set up event listeners
            setupEventListeners();
            
            // Hide loading overlay
            hideLoadingOverlay();
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            showErrorMessage('Failed to load dashboard data. Please try again later.');
            hideLoadingOverlay();
        });
}

/**
 * Initialize the data source selector
 */
function initializeDataSourceSelector() {
    const dataSourceSelect = document.getElementById('data-source-select');
    
    // Set initial value from state
    dataSourceSelect.value = dashboardState.filters.dataSource;
    
    // Check if switching is allowed (from PHP config)
    fetch('./api/config_status.php')
        .then(response => response.json())
        .then(config => {
            if (!config.allowSourceSwitching) {
                // Disable selector if switching is not allowed
                dataSourceSelect.disabled = true;
                dataSourceSelect.title = "Data source switching is disabled";
            }
        })
        .catch(error => {
            console.warn('Could not fetch config status:', error);
        });
}

/**
 * Fetch data from the backend API
 */
async function fetchDashboardData() {
    try {
        const { dataSource } = dashboardState.filters;
        const apiUrl = `./api/get_data.php?source=${dataSource}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the response based on data source
        if (dataSource === 'both') {
            // If using both sources, use mock data as fallback if database failed
            if (data.database_error) {
                console.warn('Database error:', data.database_error);
                console.log('Using mock data instead');
                return data.mock;
            }
            
            // Merge data from both sources
            // This is a simplified approach - you might want to handle duplicates or prefer one source over another
            return [...data.mock, ...data.database];
        } else {
            // Single data source
            return data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

/**
 * Set up event listeners for filters and controls
 */
function setupEventListeners() {
    // Data source selector
    document.getElementById('data-source-select').addEventListener('change', event => {
        dashboardState.filters.dataSource = event.target.value;
        
        // Show loading overlay
        showLoadingOverlay();
        
        // Reload dashboard data with new source
        fetchDashboardData()
            .then(data => {
                // Store raw data
                dashboardState.data.raw = data;
                
                // Apply filters
                applyFilters();
                
                // Update dashboard
                updateDashboard();
                
                // Hide loading overlay
                hideLoadingOverlay();
            })
            .catch(error => {
                console.error('Error loading dashboard data:', error);
                showErrorMessage('Failed to load dashboard data. Please try again later.');
                hideLoadingOverlay();
            });
    });
    
    // Date range selector
    document.getElementById('start-date').addEventListener('change', event => {
        dashboardState.filters.startDate = event.target.value;
    });
    
    document.getElementById('end-date').addEventListener('change', event => {
        dashboardState.filters.endDate = event.target.value;
    });
    
    document.getElementById('update-dashboard').addEventListener('click', () => {
        applyFilters();
        updateDashboard();
    });
    
    // Disease select
    document.getElementById('disease-select').addEventListener('change', event => {
        dashboardState.filters.disease = event.target.value;
    });
    
    // Region select
    document.getElementById('region-select').addEventListener('change', event => {
        dashboardState.filters.region = event.target.value;
    });
    
    // Age group checkboxes
    const ageCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="age-"]');
    ageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Update age groups array based on checked boxes
            dashboardState.filters.ageGroups = Array.from(ageCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
        });
    });
    
    // Gender radio buttons
    const genderRadios = document.querySelectorAll('input[type="radio"][name="gender"]');
    genderRadios.forEach(radio => {
        radio.addEventListener('change', event => {
            if (event.target.checked) {
                dashboardState.filters.gender = event.target.value;
            }
        });
    });
    
    // Data grouping select
    document.getElementById('data-grouping').addEventListener('change', event => {
        dashboardState.filters.groupBy = event.target.value;
    });
    
    // Apply filters button
    document.getElementById('apply-filters').addEventListener('click', () => {
        applyFilters();
        updateDashboard();
    });
    
    // Reset filters button
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Table search
    document.getElementById('table-search').addEventListener('input', event => {
        filterTable(event.target.value);
    });
    
    // Export CSV button
    document.getElementById('export-data').addEventListener('click', exportDataToCSV);
    
    // Pagination buttons
    document.getElementById('prev-page').addEventListener('click', () => {
        if (dashboardState.pagination.currentPage > 1) {
            dashboardState.pagination.currentPage--;
            updateDataTable();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (dashboardState.pagination.currentPage < dashboardState.pagination.totalPages) {
            dashboardState.pagination.currentPage++;
            updateDataTable();
        }
    });
}

/**
 * Apply filters to the raw data
 */
function applyFilters() {
    const { raw } = dashboardState.data;
    const { disease, region, ageGroups, gender, startDate, endDate } = dashboardState.filters;
    
    if (!raw || !raw.length) {
        return;
    }
    
    // Convert dates for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Apply filters to raw data
    let filtered = raw.filter(item => {
        const itemDate = new Date(item.date);
        
        // Date range filter
        if (itemDate < start || itemDate > end) {
            return false;
        }
        
        // Disease filter
        if (disease !== 'all' && item.disease !== disease) {
            return false;
        }
        
        // Region filter
        if (region !== 'all' && item.region !== region) {
            return false;
        }
        
        // Age group filter
        if (!ageGroups.includes(item.age_group)) {
            return false;
        }
        
        // Gender filter
        if (gender !== 'all' && item.gender !== gender) {
            return false;
        }
        
        return true;
    });
    
    // Group data if needed
    filtered = groupData(filtered, dashboardState.filters.groupBy);
    
    // Store filtered data
    dashboardState.data.filtered = filtered;
    
    // Calculate metrics
    calculateMetrics();
    
    // Calculate quick stats
    calculateQuickStats();
    
    // Update pagination
    updatePagination();
}

/**
 * Group data based on selected grouping option
 */
function groupData(data, groupBy) {
    if (groupBy === 'daily') {
        return data;
    }
    
    const groupedData = {};
    
    data.forEach(item => {
        let groupKey;
        const date = new Date(item.date);
        
        // Create the appropriate group key based on the groupBy option
        switch (groupBy) {
            case 'weekly':
                // Get the week number and year
                const weekNumber = getWeekNumber(date);
                groupKey = `${date.getFullYear()}-W${weekNumber}`;
                break;
            case 'monthly':
                // Get the month and year
                groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                break;
            case 'quarterly':
                // Get the quarter and year
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                groupKey = `${date.getFullYear()}-Q${quarter}`;
                break;
            case 'yearly':
                // Get the year
                groupKey = date.getFullYear().toString();
                break;
            default:
                // Default to daily (no grouping)
                groupKey = item.date;
        }
        
        // Initialize group if it doesn't exist
        if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
                date: item.date, // Use the first date in the group
                display_date: groupKey,
                region: item.region, // For regional grouping
                disease: item.disease, // For disease grouping
                cases: 0,
                recoveries: 0,
                deaths: 0,
                active: 0
            };
        }
        
        // Sum the values
        groupedData[groupKey].cases += item.cases;
        groupedData[groupKey].recoveries += item.recoveries;
        groupedData[groupKey].deaths += item.deaths;
        groupedData[groupKey].active += item.active;
    });
    
    // Convert the grouped data object to an array
    return Object.values(groupedData);
}

/**
 * Get the week number for a date
 */
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Calculate metrics from filtered data
 */
function calculateMetrics() {
    const { filtered } = dashboardState.data;
    
    if (!filtered || !filtered.length) {
        return;
    }
    
    // Calculate total cases, recoveries, deaths, and active cases
    const totals = filtered.reduce((acc, item) => {
        acc.cases += item.cases;
        acc.recoveries += item.recoveries;
        acc.deaths += item.deaths;
        acc.active += item.active;
        return acc;
    }, { cases: 0, recoveries: 0, deaths: 0, active: 0 });
    
    // Calculate rates
    const recoveryRate = totals.cases > 0 ? (totals.recoveries / totals.cases * 100).toFixed(2) : 0;
    const mortalityRate = totals.cases > 0 ? (totals.deaths / totals.cases * 100).toFixed(2) : 0;
    
    // Update metrics in dashboard state
    dashboardState.data.metrics = {
        totalCases: totals.cases,
        activeCases: totals.active,
        recoveryRate: parseFloat(recoveryRate),
        mortalityRate: parseFloat(mortalityRate)
    };
}

/**
 * Calculate quick stats from filtered data
 */
function calculateQuickStats() {
    const { filtered, raw } = dashboardState.data;
    
    if (!filtered || !filtered.length) {
        return;
    }
    
    // Find highest incidence disease
    const diseaseCounts = {};
    filtered.forEach(item => {
        if (!diseaseCounts[item.disease]) {
            diseaseCounts[item.disease] = 0;
        }
        diseaseCounts[item.disease] += item.cases;
    });
    
    const highestIncidence = Object.entries(diseaseCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
    
    // Find most and least affected regions
    const regionCounts = {};
    filtered.forEach(item => {
        if (!regionCounts[item.region]) {
            regionCounts[item.region] = 0;
        }
        regionCounts[item.region] += item.cases;
    });
    
    const regionEntries = Object.entries(regionCounts);
    const mostAffectedRegion = regionEntries.length > 0 ? 
        regionEntries.sort((a, b) => b[1] - a[1])[0][0] : 'N/A';
    
    const leastAffectedRegion = regionEntries.length > 0 ?
        regionEntries.sort((a, b) => a[1] - b[1])[0][0] : 'N/A';
    
    // Determine trend direction
    let trendDirection = 'Stable';
    if (filtered.length > 1) {
        // Sort by date
        const sortedData = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get the first and last half of the data
        const midpoint = Math.floor(sortedData.length / 2);
        const firstHalf = sortedData.slice(0, midpoint);
        const secondHalf = sortedData.slice(midpoint);
        
        // Calculate average cases for each half
        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.cases, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.cases, 0) / secondHalf.length;
        
        // Determine trend direction
        const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        
        if (percentChange > 10) {
            trendDirection = 'Increasing';
        } else if (percentChange < -10) {
            trendDirection = 'Decreasing';
        } else {
            trendDirection = 'Stable';
        }
    }
    
    // Update quick stats in dashboard state
    dashboardState.data.quickStats = {
        highestIncidence,
        mostAffectedRegion,
        leastAffectedRegion,
        trendDirection
    };
}

/**
 * Update pagination based on filtered data
 */
function updatePagination() {
    const { filtered } = dashboardState.data;
    const { itemsPerPage } = dashboardState.pagination;
    
    if (!filtered) {
        dashboardState.pagination.totalPages = 1;
        return;
    }
    
    dashboardState.pagination.totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    // Reset to page 1 when filters change
    dashboardState.pagination.currentPage = 1;
}

/**
 * Update the dashboard with current state
 */
function updateDashboard() {
    // Update metrics cards
    updateMetricsCards();
    
    // Update quick stats
    updateQuickStats();
    
    // Update data table
    updateDataTable();
    
    // Update charts
    updateCharts();
}

/**
 * Update metrics cards with current data
 */
function updateMetricsCards() {
    const { totalCases, activeCases, recoveryRate, mortalityRate } = dashboardState.data.metrics;
    
    // Update total cases
    const totalCasesElement = document.getElementById('total-cases');
    totalCasesElement.querySelector('.metric-value').textContent = totalCases.toLocaleString();
    
    // Update active cases
    const activeCasesElement = document.getElementById('active-cases');
    activeCasesElement.querySelector('.metric-value').textContent = activeCases.toLocaleString();
    
    // Update recovery rate
    const recoveryRateElement = document.getElementById('recovery-rate');
    recoveryRateElement.querySelector('.metric-value').textContent = `${recoveryRate}%`;
    
    // Update mortality rate
    const mortalityRateElement = document.getElementById('mortality-rate');
    mortalityRateElement.querySelector('.metric-value').textContent = `${mortalityRate}%`;
}

/**
 * Update quick stats section
 */
function updateQuickStats() {
    const { highestIncidence, mostAffectedRegion, leastAffectedRegion, trendDirection } = dashboardState.data.quickStats;
    
    document.getElementById('highest-incidence').textContent = highestIncidence;
    document.getElementById('most-affected-region').textContent = mostAffectedRegion;
    document.getElementById('least-affected-region').textContent = leastAffectedRegion;
    document.getElementById('trend-direction').textContent = trendDirection;
}

/**
 * Update data table with filtered data
 */
function updateDataTable() {
    const { filtered } = dashboardState.data;
    const { currentPage, itemsPerPage } = dashboardState.pagination;
    
    if (!filtered || !filtered.length) {
        // Display no data message
        const tbody = document.querySelector('#data-table tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading-data">No data available</td></tr>';
        return;
    }
    
    // Calculate slice indices for pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get the slice of data for current page
    const pageData = filtered.slice(startIndex, endIndex);
    
    // Populate table rows
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    
    pageData.forEach(item => {
        const row = document.createElement('tr');
        
        // Format date for display
        const displayDate = item.display_date || new Date(item.date).toLocaleDateString();
        
        row.innerHTML = `
            <td>${item.region}</td>
            <td>${item.disease}</td>
            <td>${displayDate}</td>
            <td>${item.cases.toLocaleString()}</td>
            <td>${item.recoveries.toLocaleString()}</td>
            <td>${item.deaths.toLocaleString()}</td>
            <td>${item.active.toLocaleString()}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update pagination controls
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === dashboardState.pagination.totalPages;
    document.getElementById('page-indicator').textContent = `Page ${currentPage} of ${dashboardState.pagination.totalPages}`;
}

/**
 * Filter table based on search term
 */
function filterTable(searchTerm) {
    if (!searchTerm.trim()) {
        // If search is empty, reset to filtered data
        applyFilters();
        updateDataTable();
        return;
    }
    
    const { filtered } = dashboardState.data;
    
    if (!filtered || !filtered.length) {
        return;
    }
    
    // Convert search term to lowercase for case-insensitive search
    const term = searchTerm.toLowerCase().trim();
    
    // Filter the data
    const searchFiltered = filtered.filter(item => {
        return (
            item.region.toLowerCase().includes(term) ||
            item.disease.toLowerCase().includes(term) ||
            (item.display_date && item.display_date.toLowerCase().includes(term))
        );
    });
    
    // Update the filtered data temporarily for table display
    const originalFiltered = dashboardState.data.filtered;
    dashboardState.data.filtered = searchFiltered;
    
    // Update pagination for the search results
    updatePagination();
    
    // Update table with search results
    updateDataTable();
    
    // Restore the original filtered data for other components
    dashboardState.data.filtered = originalFiltered;
}

/**
 * Export data to CSV file
 */
function exportDataToCSV() {
    const { filtered } = dashboardState.data;
    
    if (!filtered || !filtered.length) {
        showErrorMessage('No data available to export');
        return;
    }
    
    // Create CSV header
    let csvContent = 'Region,Disease,Date,Cases,Recoveries,Deaths,Active\n';
    
    // Add data rows
    filtered.forEach(item => {
        const displayDate = item.display_date || item.date;
        csvContent += `"${item.region}","${item.disease}","${displayDate}",${item.cases},${item.recoveries},${item.deaths},${item.active}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `epidash_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Add link to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Reset filters to defaults
 */
function resetFilters() {
    // Reset filter values in the UI
    document.getElementById('disease-select').value = 'all';
    document.getElementById('region-select').value = 'all';
    document.getElementById('start-date').value = '2023-01-01';
    document.getElementById('end-date').value = '2023-12-31';
    document.getElementById('data-grouping').value = 'weekly';
    document.getElementById('gender-all').checked = true;
    
    // Reset age group checkboxes
    const ageCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="age-"]');
    ageCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Reset filter state
    dashboardState.filters = {
        disease: 'all',
        region: 'all',
        ageGroups: ['0-14', '15-24', '25-44', '45-64', '65+'],
        gender: 'all',
        groupBy: 'weekly',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
    };
    
    // Apply reset filters
    applyFilters();
    updateDashboard();
}

/**
 * Show loading overlay
 */
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
}

/**
 * Show error message to the user
 */
function showErrorMessage(message) {
    // You could implement a toast or alert system here
    alert(message);
}