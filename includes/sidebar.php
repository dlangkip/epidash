<aside class="sidebar">
    <div class="filters-section">
        <h3>Filters</h3>
        <div class="filter-group">
            <label for="disease-select">Disease:</label>
            <select id="disease-select" class="filter-control">
                <option value="all" selected>All Diseases</option>
                <option value="malaria">Malaria</option>
                <option value="tuberculosis">Tuberculosis</option>
                <option value="cholera">Cholera</option>
                <option value="dengue">Dengue Fever</option>
                <option value="typhoid">Typhoid</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="region-select">Region:</label>
            <select id="region-select" class="filter-control">
                <option value="all" selected>All Regions</option>
                <?php
                // Include the regions data file
                include_once './data/regions.php';
                
                // Output each region as an option
                if (isset($regions) && is_array($regions)) {
                    foreach ($regions as $region_code => $region_name) {
                        echo "<option value=\"{$region_code}\">{$region_name}</option>";
                    }
                }
                ?>
            </select>
        </div>
        
        <div class="filter-group">
            <label>Age Group:</label>
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" id="age-0-14" value="0-14" checked>
                    <label for="age-0-14">0-14</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="age-15-24" value="15-24" checked>
                    <label for="age-15-24">15-24</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="age-25-44" value="25-44" checked>
                    <label for="age-25-44">25-44</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="age-45-64" value="45-64" checked>
                    <label for="age-45-64">45-64</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="age-65-plus" value="65+" checked>
                    <label for="age-65-plus">65+</label>
                </div>
            </div>
        </div>
        
        <div class="filter-group">
            <label>Gender:</label>
            <div class="radio-group">
                <div class="radio-item">
                    <input type="radio" id="gender-all" name="gender" value="all" checked>
                    <label for="gender-all">All</label>
                </div>
                <div class="radio-item">
                    <input type="radio" id="gender-male" name="gender" value="male">
                    <label for="gender-male">Male</label>
                </div>
                <div class="radio-item">
                    <input type="radio" id="gender-female" name="gender" value="female">
                    <label for="gender-female">Female</label>
                </div>
            </div>
        </div>
        
        <div class="filter-group">
            <label for="data-grouping">Group By:</label>
            <select id="data-grouping" class="filter-control">
                <option value="daily">Daily</option>
                <option value="weekly" selected>Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
            </select>
        </div>
        
        <div class="filter-actions">
            <button id="apply-filters" class="btn-primary full-width">Apply Filters</button>
            <button id="reset-filters" class="btn-secondary full-width">Reset Filters</button>
        </div>
    </div>
    
    <div class="quick-stats">
        <h3>Quick Stats</h3>
        <div class="stat-item">
            <span class="stat-label">Highest Incidence:</span>
            <span class="stat-value" id="highest-incidence">Loading...</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Most Affected Region:</span>
            <span class="stat-value" id="most-affected-region">Loading...</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Least Affected Region:</span>
            <span class="stat-value" id="least-affected-region">Loading...</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Trend Direction:</span>
            <span class="stat-value" id="trend-direction">Loading...</span>
        </div>
    </div>
</aside>