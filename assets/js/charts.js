/**
 * EpiDash - Epidemiological Data Dashboard
 * charts.js - Chart initialization and configuration
 */

/**
 * Initialize all charts
 */
function initializeCharts() {
    initializeTrendsChart();
    initializeRegionChart();
    initializeAgeChart();
    initializeRecoveryChart();
}

/**
 * Initialize the disease trends chart
 */
function initializeTrendsChart() {
    const ctx = document.getElementById('trends-chart').getContext('2d');
    
    dashboardState.charts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Cases'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Disease Trend Over Time',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'bottom'
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

/**
 * Initialize the region distribution chart
 */
function initializeRegionChart() {
    const ctx = document.getElementById('region-chart').getContext('2d');
    
    dashboardState.charts.region = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Cases by Region',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Region'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Cases'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Cases by Region',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Initialize the age distribution chart
 */
function initializeAgeChart() {
    const ctx = document.getElementById('age-chart').getContext('2d');
    
    dashboardState.charts.age = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['0-14', '15-24', '25-44', '45-64', '65+'],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cases by Age Group',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Initialize the recovery timeline chart
 */
function initializeRecoveryChart() {
    const ctx = document.getElementById('recovery-chart').getContext('2d');
    
    dashboardState.charts.recovery = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Cases',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Recoveries',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Cases vs. Recoveries',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'bottom'
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

/**
 * Update all charts with current data
 */
function updateCharts() {
    updateTrendsChart();
    updateRegionChart();
    updateAgeChart();
    updateRecoveryChart();
}

/**
 * Update the disease trends chart with filtered data
 */
function updateTrendsChart() {
    const { filtered } = dashboardState.data;
    const chart = dashboardState.charts.trends;
    
    if (!filtered || !filtered.length || !chart) {
        return;
    }
    
    // Group data by date and disease
    const dateGroups = {};
    const diseases = new Set();
    
    filtered.forEach(item => {
        // Use display_date if available (for grouped data)
        const dateKey = item.display_date || item.date;
        
        if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = {};
        }
        
        if (!dateGroups[dateKey][item.disease]) {
            dateGroups[dateKey][item.disease] = 0;
        }
        
        dateGroups[dateKey][item.disease] += item.cases;
        diseases.add(item.disease);
    });
    
    // Convert to sorted array of dates
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
        if (a.includes('W') || a.includes('Q')) {
            // Handle weekly or quarterly format
            return a.localeCompare(b);
        } else {
            // Handle date format
            return new Date(a) - new Date(b);
        }
    });
    
    // Prepare datasets
    const datasets = [];
    const colorPalette = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)'
    ];
    
    // Create a dataset for each disease
    Array.from(diseases).forEach((disease, index) => {
        const color = colorPalette[index % colorPalette.length];
        
        const data = sortedDates.map(date => {
            return dateGroups[date][disease] || 0;
        });
        
        datasets.push({
            label: disease,
            data: data,
            backgroundColor: color.replace('1)', '0.2)'),
            borderColor: color,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 3
        });
    });
    
    // Update chart data
    chart.data.labels = sortedDates;
    chart.data.datasets = datasets;
    chart.update();
}

/**
 * Update the region distribution chart with filtered data
 */
function updateRegionChart() {
    const { filtered } = dashboardState.data;
    const chart = dashboardState.charts.region;
    
    if (!filtered || !filtered.length || !chart) {
        return;
    }
    
    // Group data by region
    const regionGroups = {};
    
    filtered.forEach(item => {
        if (!regionGroups[item.region]) {
            regionGroups[item.region] = 0;
        }
        
        regionGroups[item.region] += item.cases;
    });
    
    // Convert to arrays for the chart
    const regions = Object.keys(regionGroups);
    const caseCounts = regions.map(region => regionGroups[region]);
    
    // Sort by case count (descending)
    const sortedData = regions.map((region, index) => ({
        region,
        cases: caseCounts[index]
    })).sort((a, b) => b.cases - a.cases);
    
    // Limit to top 10 regions if there are many
    const chartData = sortedData.slice(0, 10);
    
    // Update chart data
    chart.data.labels = chartData.map(item => item.region);
    chart.data.datasets[0].data = chartData.map(item => item.cases);
    chart.update();
}

/**
 * Update the age distribution chart with filtered data
 */
function updateAgeChart() {
    const { filtered } = dashboardState.data;
    const chart = dashboardState.charts.age;
    
    if (!filtered || !filtered.length || !chart) {
        return;
    }
    
    // Group data by age group
    const ageGroups = {
        '0-14': 0,
        '15-24': 0,
        '25-44': 0,
        '45-64': 0,
        '65+': 0
    };
    
    filtered.forEach(item => {
        if (item.age_group in ageGroups) {
            ageGroups[item.age_group] += item.cases;
        }
    });
    
    // Update chart data
    chart.data.datasets[0].data = Object.values(ageGroups);
    chart.update();
}

/**
 * Update the recovery timeline chart with filtered data
 */
function updateRecoveryChart() {
    const { filtered } = dashboardState.data;
    const chart = dashboardState.charts.recovery;
    
    if (!filtered || !filtered.length || !chart) {
        return;
    }
    
    // Group data by date
    const dateGroups = {};
    
    filtered.forEach(item => {
        // Use display_date if available (for grouped data)
        const dateKey = item.display_date || item.date;
        
        if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = {
                cases: 0,
                recoveries: 0
            };
        }
        
        dateGroups[dateKey].cases += item.cases;
        dateGroups[dateKey].recoveries += item.recoveries;
    });
    
    // Convert to sorted array of dates
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
        if (a.includes('W') || a.includes('Q')) {
            // Handle weekly or quarterly format
            return a.localeCompare(b);
        } else {
            // Handle date format
            return new Date(a) - new Date(b);
        }
    });
    
    // Prepare data arrays
    const casesData = sortedDates.map(date => dateGroups[date].cases);
    const recoveriesData = sortedDates.map(date => dateGroups[date].recoveries);
    
    // Update chart data
    chart.data.labels = sortedDates;
    chart.data.datasets[0].data = casesData;
    chart.data.datasets[1].data = recoveriesData;
    chart.update();
}