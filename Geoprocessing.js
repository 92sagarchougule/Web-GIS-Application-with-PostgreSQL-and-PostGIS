var buffer = document.getElementById('buffer');

document.getElementById('buffer').addEventListener('click',function(){

// geoprocessing.js

// Create a new Vector source and layer for GeoJSON features
var vectorSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: geojsonUrl, // Directly specify the URL
    strategy: ol.loadingstrategy.bbox // Use bbox strategy for loading GeoJSON
});

var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: my_style // Apply the defined style to the features
});

// Add the vector layer to the map passed from main.js
map.addLayer(vectorLayer);

// Event listener for buffer button click
document.getElementById('buffer').addEventListener('click', function() {
    var parser = new jsts.io.OL3Parser(); // Instantiate the parser

    // Handle feature loading and processing
    vectorSource.on('change', function() {
        if (vectorSource.getState() === 'ready') {
            var features = vectorSource.getFeatures();

            features.forEach(function(feature) {
                var olGeom = feature.getGeometry();
                var jstsGeom = parser.read(olGeom);

                // Perform buffer operation (10 meters in this example)
                var buffered = jstsGeom.buffer(100);

                // Convert back to OpenLayers geometry and update feature
                var bufferedOlGeom = parser.write(buffered);
                feature.setGeometry(bufferedOlGeom);
            });

            // Refresh the layer to reflect changes
            vectorSource.refresh();
        }
    });
});

})
