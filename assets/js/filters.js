/**
 * EpiDash - Epidemiological Data Dashboard
 * filters.js - Filter handling and interaction logic
 */

/**
 * Initialize filter values when dashboard loads
 */
function initializeFilters() {
    // Set default values in the UI
    document.getElementById('start-date').value = dashboardState.filters.startDate;
    document.getElementById('end-date').value = dashboardState.filters.endDate;
    document.getElementById('disease-select').value = dashboardState.filters.disease;
    document.getElementById('region-select').value = dashboardState.filters.region;
    document.getElementById('data-grouping').value = dashboardState.filters.groupBy;
    
    // Set gender radio
    document.getElementById(`gender-${dashboardState.filters.gender}`).checked = true;
    
    // Set age group checkboxes
    dashboardState.filters.ageGroups.forEach(ageGroup => {
        const ageId = ageGroup.replace('+', 'plus'); // Handle 65+ case
        document.getElementById(`age-${ageId}`).checked = true;
    });
    
    // Initialize tooltips for filter elements
    initializeTooltips();
    
    // Set up collapsible sections for mobile
    setupCollapsibleSections();
}

/**
 * Set up tooltips for filter controls
 */
function initializeTooltips() {
    // You would typically use a tooltip library here
    // This is a simplified implementation
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.setAttribute('title', element.getAttribute('data-tooltip'));
    });
}

/**
 * Set up collapsible sections for mobile view
 */
function setupCollapsibleSections() {
    const collapsibleHeadings = document.querySelectorAll('.sidebar h3');
    
    collapsibleHeadings.forEach(heading => {
        heading.classList.add('collapsible');
        
        // Add click handler for mobile view
        heading.addEventListener('click', function() {
            // Only apply collapsible behavior in mobile view
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');
                
                // Get the next sibling element (the content to collapse)
                const content = this.nextElementSibling;
                
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            }
        });
    });
}

/**
 * Save the current filter state
 */
function saveFilterState() {
    // Get values from UI
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const disease = document.getElementById('disease-select').value;
    const region = document.getElementById('region-select').value;
    const groupBy = document.getElementById('data-grouping').value;
    
    // Get gender selection
    let gender = 'all';
    const genderRadios = document.querySelectorAll('input[type="radio"][name="gender"]');
    genderRadios.forEach(radio => {
        if (radio.checked) {
            gender = radio.value;
        }
    });
    
    // Get age group selections
    const ageGroups = [];
    const ageCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="age-"]');
    ageCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            ageGroups.push(checkbox.value);
        }
    });
    
    // Update dashboard state
    dashboardState.filters = {
        startDate,
        endDate,
        disease,
        region,
        ageGroups,
        gender,
        groupBy
    };
    
    // Save to localStorage for persistence
    saveToLocalStorage();
}

/**
 * Apply quick filter for a specific disease
 */
function applyDiseaseFilter(disease) {
    document.getElementById('disease-select').value = disease;
    dashboardState.filters.disease = disease;
    
    applyFilters();
    updateDashboard();
}

/**
 * Apply quick filter for a specific region
 */
function applyRegionFilter(region) {
    document.getElementById('region-select').value = region;
    dashboardState.filters.region = region;
    
    applyFilters();
    updateDashboard();
}

/**
 * Apply quick filter for a specific age group
 */
function applyAgeGroupFilter(ageGroup) {
    // Uncheck all age groups
    const ageCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="age-"]');
    ageCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Check only the selected age group
    const ageId = ageGroup.replace('+', 'plus'); // Handle 65+ case
    document.getElementById(`age-${ageId}`).checked = true;
    
    dashboardState.filters.ageGroups = [ageGroup];
    
    applyFilters();
    updateDashboard();
}

/**
 * Apply quick filter for a specific time period
 */
function applyTimePeriodFilter(period) {
    const today = new Date();
    let startDate = new Date(today);
    
    switch (period) {
        case 'last7days':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'last30days':
            startDate.setDate(today.getDate() - 30);
            break;
        case 'last90days':
            startDate.setDate(today.getDate() - 90);
            break;
        case 'lastYear':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        default:
            startDate = new Date('2023-01-01');
    }
    
    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Update date inputs and state
    document.getElementById('start-date').value = formatDate(startDate);
    document.getElementById('end-date').value = formatDate(today);
    
    dashboardState.filters.startDate = formatDate(startDate);
    dashboardState.filters.endDate = formatDate(today);
    
    applyFilters();
    updateDashboard();
}

/**
 * Save dashboard state to localStorage
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem('epidash_filters', JSON.stringify(dashboardState.filters));
    } catch (error) {
        console.warn('Could not save filters to localStorage:', error);
    }
}

/**
 * Load dashboard state from localStorage
 */
function loadFromLocalStorage() {
    try {
        const savedFilters = localStorage.getItem('epidash_filters');
        
        if (savedFilters) {
            dashboardState.filters = JSON.parse(savedFilters);
            
            // Update UI to reflect loaded state
            document.getElementById('start-date').value = dashboardState.filters.startDate;
            document.getElementById('end-date').value = dashboardState.filters.endDate;
            document.getElementById('disease-select').value = dashboardState.filters.disease;
            document.getElementById('region-select').value = dashboardState.filters.region;
            document.getElementById('data-grouping').value = dashboardState.filters.groupBy;
            
            // Update gender radio
            document.getElementById(`gender-${dashboardState.filters.gender}`).checked = true;
            
            // Update age group checkboxes
            const ageCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="age-"]');
            ageCheckboxes.forEach(checkbox => {
                checkbox.checked = dashboardState.filters.ageGroups.includes(checkbox.value);
            });
        }
    } catch (error) {
        console.warn('Could not load filters from localStorage:', error);
    }
}