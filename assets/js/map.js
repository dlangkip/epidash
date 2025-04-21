/**
 * EpiDash - Epidemiological Data Dashboard
 * map.js - Geographic visualization with Leaflet
 */

// Store the map instance
let map;
// Store the current info box
let infoBox;
// Store the current legend
let legend;
// Store the current layer
let choroplethLayer;

/**
 * Initialize the map
 */
function initializeMap() {
    // Initialize the Leaflet map centered on Kenya
    map = L.map('disease-map').setView([-1.286389, 36.817223], 6);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Create info box
    infoBox = L.control({ position: 'topright' });
    
    infoBox.onAdd = function() {
        this._div = L.DomUtil.create('div', 'info-box');
        this.update();
        return this._div;
    };
    
    infoBox.update = function(props) {
        this._div.innerHTML = '<h4>Disease Prevalence</h4>' + 
            (props ? 
                '<b>' + props.name + '</b><br />' + props.cases + ' cases' :
                'Hover over a region');
    };
    
    infoBox.addTo(map);
    
    // Create legend
    legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 10, 50, 100, 500, 1000, 5000, 10000];
        const colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
        
        div.innerHTML = '<h4>Cases</h4>';
        
        // Loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        
        return div;
    };
    
    legend.addTo(map);
    
    // Update the map with current data
    updateMap();
}

/**
 * Update the map with filtered data
 */
function updateMap() {
    const { filtered } = dashboardState.data;
    
    if (!filtered || !filtered.length || !map) {
        return;
    }
    
    // Fetch geojson data for regions
    fetch('./data/kenya_counties.geojson')
        .then(response => response.json())
        .then(geodata => {
            // Group data by region
            const regionCases = {};
            
            filtered.forEach(item => {
                if (!regionCases[item.region]) {
                    regionCases[item.region] = 0;
                }
                
                regionCases[item.region] += item.cases;
            });
            
            // Remove previous layer if it exists
            if (choroplethLayer) {
                map.removeLayer(choroplethLayer);
            }
            
            // Create the new choropleth layer
            choroplethLayer = L.geoJson(geodata, {
                style: feature => {
                    const regionName = feature.properties.name;
                    const cases = regionCases[regionName] || 0;
                    
                    return {
                        fillColor: getColor(cases),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: (feature, layer) => {
                    const regionName = feature.properties.name;
                    const cases = regionCases[regionName] || 0;
                    
                    // Add properties for the info box
                    layer.feature.properties.cases = cases;
                    
                    // Add hover interactions
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: zoomToFeature
                    });
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('Error loading geojson data:', error);
        });
}

/**
 * Get color based on case count
 */
function getColor(cases) {
    return cases > 10000 ? '#800026' :
           cases > 5000  ? '#BD0026' :
           cases > 1000  ? '#E31A1C' :
           cases > 500   ? '#FC4E2A' :
           cases > 100   ? '#FD8D3C' :
           cases > 50    ? '#FEB24C' :
           cases > 10    ? '#FED976' :
                          '#FFEDA0';
}

/**
 * Highlight a region on mouseover
 */
function highlightFeature(e) {
    const layer = e.target;
    
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    
    infoBox.update(layer.feature.properties);
}

/**
 * Reset highlight on mouseout
 */
function resetHighlight(e) {
    choroplethLayer.resetStyle(e.target);
    infoBox.update();
}

/**
 * Zoom to a region on click
 */
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}