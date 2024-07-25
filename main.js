var drawInteraction, startedit, stopedit;


document.addEventListener('DOMContentLoaded', function() {
    var coll = document.getElementsByClassName('collapsible');
    for (var i = 0; i < coll.length; i++) {
        var header = coll[i].getElementsByTagName('h3')[0];
        header.addEventListener('click', function() {
            var content = this.nextElementSibling; // Get the content div
            this.classList.toggle('active'); // Toggle active class on the header
            if (content.style.display === 'block') {
                content.style.display = 'none'; // Hide the content if it's visible
            } else {
                content.style.display = 'block'; // Show the content if it's hidden
            }
        });

        // Prevent collapse when interacting with elements inside content
        var contentElements = coll[i].querySelectorAll('.content *');
        for (var j = 0; j < contentElements.length; j++) {
            contentElements[j].addEventListener('click', function(event) {
                event.stopPropagation(); // Stop event propagation to parent elements
            });
        }
    }
});





/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
var clearfc = document.getElementById('clr-fc');

var intersectButton = document.getElementById('Intersection');

var clearintersectButton = document.getElementById('clearIntersectionEffects');

var exportIntersection = document.getElementById('exportIntersection');

exportIntersection.disabled = true;

intersectButton.disabled = true;
clearintersectButton.disabled = true;



clearfc.disabled = true;

// WMS layer from geoserver
var layer = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url:"http://localhost:8080/geoserver/cite/wms?",
    params:{
      LAYERS:'features'
    }
  })
});


var selectedFeature = null;






// functioning for draw polygon and save data in db

const overlay = new ol.Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});


// coloser for popup
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


// draw a layer in vector
var drawLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 3,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 0, 0, .8)',
    }),
  }),
});




document.getElementById('geometry').onchange = function(){

  var geom = document.getElementById('geometry').value;

console.log(geom);

}






// draw interaction
drawInteraction = new ol.interaction.Draw({
  type: 'Polygon', 
  source: drawLayer.getSource(),
});

// edit start and stop code
var startedit = document.getElementById('start-edit');
startedit.addEventListener('click', startbutton);

function startbutton() {
  selectedFeature = null;
  console.log('Start Edit');
  map.addInteraction(drawInteraction);
  startedit.disabled = true; // Disable the start button when editing starts
  stopedit.disabled = false; // Enable the stop button
  
}


// Start edit
var stopedit = document.getElementById('stop-edit');
stopedit.addEventListener('click', stopbutton);
stopedit.disabled = true; // Enable the stop button

function stopbutton() {
  console.log('Stop Edit');
  map.removeInteraction(drawInteraction);
  startedit.disabled = false; // Enable the start button when editing stops
  stopedit.disabled = true; // Disable the stop button
  var source = layer.getSource();
  var params = source.getParams();
  params.t = new Date().getMilliseconds();
  source.updateParams(params);

}


// Listen for drawend event
drawInteraction.on('drawstart', function (event) {
  var source = layer.getSource();
  var params = source.getParams();
  params.t = new Date().getMilliseconds();
  source.updateParams(params);
});

// Listen for drawend event
drawInteraction.on('drawend', function (event) {
  var feature = event.feature;
  var geometry = feature.getGeometry();
  displayPopup(geometry);
});


// Function to get popup and add data
function displayPopup(geometry) {
  var extent = geometry.getExtent();
  var center = ol.extent.getCenter(extent);

  var popupContent = `
    <table id='table'>
      <tr>
        <th>Name:</th>
        <th>District:</th>
      </tr>
      <tr>
        <td><textarea name='name' id='name'></textarea></td>
        <td><textarea name='dist' id='dist'></textarea></td>
        <td><button id='saveButton'>Save Feature</button></td>
      </tr>
    </table>
  `;
  content.innerHTML = popupContent;
  overlay.setPosition(center);

  // Event listener for the save button click
  document.getElementById('saveButton').addEventListener('click', function (event) {
    var nameTextArea = document.getElementById('name');
    var distTextArea = document.getElementById('dist');
    if (nameTextArea && distTextArea) {
      var nameText = nameTextArea.value;
      var distText = distTextArea.value;

      console.log('Saving feature with name:', nameText);

      var geoJSON = new ol.format.GeoJSON();
      var feature = new ol.Feature(geometry);
      feature.setProperties({ name: nameText, distText: distText });

      // Call saveFeature for each feature drawn
      saveFeature(feature);
    } else {
      console.log('#name or #dist textarea element not found in DOM.');
    }
  });
}


// function to add feature through api
function saveFeature(feature) {
  var geoJSON = new ol.format.GeoJSON();
  var geometry = geoJSON.writeGeometry(feature.getGeometry(), {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  });

  var name = feature.get('name');
  var distText = feature.get('distText');

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:5000/save_feature', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var response = xhr.responseText;
        // alert(response); // Alert response from server (success or error message)
      } else {
        alert('Error saving feature. Please try again.');
      }
    }
  };

  // Send geometry and attributes as JSON payload
  xhr.send(JSON.stringify({ geometry: geometry, name: name, distText: distText }));
}


// Geometry writing function
// var geoJSON = new ol.format.GeoJSON();
 // var geometry = geoJSON.writeGeometry(feature.getGeometry(), {



// Map class starts here ------------------------------------------------------------------------------------------------------


var map = new ol.Map({
  target: 'map',
  overlays: [overlay],
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([74.6112069940567, 16.86419429706548]),
    zoom: 17,
  }),
});


map.addLayer(drawLayer);

// map.addLayer(layer);


// GeoJSON layer from GeoServer


// GeoJSON URL from GeoServer
var geojsonUrl = "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Afeatures&maxFeatures=50&outputFormat=application%2Fjson";

// Style for the GeoJSON features

var my_style = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'black',
    width: 1,
    lineDashOffset:.1
  }),
  fill: new ol.style.Fill({
    color:'rgb(0, 0, 255,.2)'
  })
});


var vector_style = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'black',
    width: 4.25,
  }),
  fill: new ol.style.Fill({
    color:'rgb(255,0,0,.7)'
  })
});

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

// Add the vector layer to the map
map.addLayer(vectorLayer);
       

            var delele = document.getElementById('delete-fc');
                delele.disabled = true;

                var parser = new jsts.io.OL3Parser();


                map.on('click', function(evt) {
                  // console.log(evt.extent);
                  var coordinate = evt.coordinate;
                  // var geometry = feature.getGeometry();
                  // var extent = geometry.getExtent();
                  // var center = ol.extent.getCenter(extent);

                  var featureFound = false; // Track if a feature was found
                  map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                      featureFound = true; // A feature was found
                      delele.disabled = false; // Enable the delete button
                      
                      // Check if the layer is vectorLayer
                      if (layer === vectorLayer) {
                        // console.log('Yes, selected only vector layer');
            
                        if (selectedFeature) {
                            selectedFeature.setStyle(undefined);
                        }
                        // Set the style of the currently selected feature
                        feature.setStyle(vector_style);
                        // Update the selectedFeature variable
                        selectedFeature = feature;
                        clearfc.disabled = false;
            
                        // Get center feature and zoom
                        // map.getView().setCenter(ol.extent.getCenter(feature.getGeometry().getExtent()));
                        // map.getView().setZoom(17);

                        // popup
                        console.log(feature.get('name'));

                        var fcname = feature.get('name');
                        var fcdist = feature.get('dist');

                        container.innerHTML = `<table>
                                                <tr>
                                                <th>Name</th> 
                                                <th>District</th>
                                                </tr>
                                                <tr>
                                                <td>${fcname}</td>
                                                <td>${fcdist}</td>
                                                </tr>
                                               </table>`;

                        overlay.setPosition(coordinate);
                        
                        // Return the feature if needed
                        return feature;
                    }
                });
                  if (!featureFound && selectedFeature) {
                      // No feature was found, deselect the currently selected feature
                      selectedFeature.setStyle(undefined);
                      clearfc.disabled = true;
                      selectedFeature = null;
                      delele.disabled = true; // Disable the delete button when no feature is selected
                      overlay.setPosition(undefined);
                  }
              });
              


            document.getElementById('clr-fc').addEventListener('click', function(){
              selectedFeature.setStyle(undefined);
              console.log('clear feature');
              clearfc.disabled = false;
              delele.disabled = true; // Disable the delete button when no feature is selected
            });
      



// Event listener for delete button ------------------------------------------------------------------------------------------------------------------------------
            document.getElementById('delete-fc').addEventListener('click', function(event) {
              console.log('Delete function called');
              startedit.disabled = true; // Disable the start button when editing starts
              // Function to handle feature data
              function fcdata(current_fc) {
                  if (current_fc) {
                      var nameText = current_fc.get('name'); // Assuming 'name' is a property of the feature
                      // Call deletefeature with the selected feature's name
                      deletefeature(nameText);
                  } else {
                      alert('Please Select feature !');
                      
                      delele.disabled = true;
                  }
              }
              // Call fcdata with the selected feature
              fcdata(selectedFeature);
            });


            // Function to delete feature through API
            function deletefeature(nameText) {
              var xhr = new XMLHttpRequest();
              xhr.open('POST', 'http://localhost:5000/delete_feature', true);
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.onreadystatechange = function () {
                  if (xhr.readyState === 4) {
                      if (xhr.status === 200) {
                          var response = JSON.parse(xhr.responseText);
                          // alert(response.message); // Alert response from server (success or error message)
                      } else {
                          alert('Error deleting feature. Please try again.');
                      }
                  }
              };
              // Send name as JSON payload
              xhr.send(JSON.stringify({ name: nameText }));
            }





// Buffer code --------------------------------------------------------------------------------------------------------------------
// Function to buffer features based on distance
function bufferFeatures(distance) {
  try {
      var features = vectorSource.getFeatures();
      var parser = new jsts.io.OL3Parser(); // Instantiate the parser

      features.forEach(function(feature) {
          var geom = feature.getGeometry();
          // Preserve the original geometry if not already buffered
          if (!feature.get('originalGeometry')) {
              feature.set('originalGeometry', geom.clone()); // Clone to preserve original
          }

          var jstsGeom = parser.read(geom);
          var buffered = jstsGeom.buffer(distance);
          var bufferedOlGeom = parser.write(buffered);
          feature.setGeometry(bufferedOlGeom);
          intersectButton.disabled = false;
      });

      // Refresh the vector layer to reflect the changes
      vectorLayer.getSource().changed();
      console.log('Features buffered successfully');
  } catch (error) {
      console.error('Error buffering features:', error);
      alert('Error buffering features. Please try again.');
  }
}

// Event listener for Buffer button click
document.getElementById('buffer').addEventListener('click', function() {
  var distanceInput = document.getElementById('distance');
  var distanceValue = parseFloat(distanceInput.value); // Get distance value

  if (isNaN(distanceValue)) {
      alert('Please enter a valid number for distance.');
      return;
  }

  bufferFeatures(distanceValue); // Call bufferFeatures with the distance value
});

// Event listener for Clear Buffer button click
document.getElementById('clearBuffer').addEventListener('click', function() {
  try {
      var features = vectorSource.getFeatures();
      features.forEach(function(feature) {
          var originalGeom = feature.get('originalGeometry');
          if (originalGeom) {
              feature.setGeometry(originalGeom.clone()); // Restore original geometry
              feature.unset('originalGeometry'); // Remove originalGeometry property
          }
      });

      // Refresh the vector layer to reflect the changes
      vectorLayer.getSource().changed();
      console.log('Buffer effects cleared successfully');
      

  } catch (error) {
      console.error('Error clearing buffer effects:', error);
      alert('Error clearing buffer effects. Please try again.');
  }
});




// Intersection of buffer features -----------------------------------------------------------------------------------------------------------------------------------

function intersectingFeatureAnalysis() {
  var bufferedFeatures = vectorSource.getFeatures();
  var allFeatures = vectorLayer.getSource().getFeatures();
  clearintersectButton.disabled = false;

  // Prepare an array to collect intersecting features
  var intersectingFeatures = [];

  // Loop through buffered features to check intersection with other features
  bufferedFeatures.forEach(function(bufferedFeature) {
      var bufferedGeom = bufferedFeature.getGeometry();
      var jstsBufferedGeom = parser.read(bufferedGeom);

      // Loop through all features to find intersections with buffered feature
      allFeatures.forEach(function(feature) {
          if (feature !== bufferedFeature) {
              var featureGeom = feature.getGeometry();
              var jstsFeatureGeom = parser.read(featureGeom);

              // Check intersection
              if (jstsBufferedGeom.intersects(jstsFeatureGeom)) {
                  intersectingFeatures.push(feature);

                  // Style intersecting feature
                  feature.setStyle(new ol.style.Style({
                      stroke: new ol.style.Stroke({
                          color: 'green',
                          width: 2,
                      }),
                      fill: new ol.style.Fill({
                          color: 'rgba(255, 0, 0, 0.4)',
                      }),
                  }));
              }
          }
      });
  });

  // Convert intersecting features to GeoJSON
  var geojsonFormat = new ol.format.GeoJSON({dataProjection: 'EPSG:4326',featureProjection: 'EPSG:3857' });
  var geojsonFeatures = geojsonFormat.writeFeatures(intersectingFeatures);
        exportIntersection.disabled = false;
        document.getElementById('exportIntersection').addEventListener('click', function() {

        // Handle GeoJSON export
            if (geojsonFeatures) {
                var blob = new Blob([geojsonFeatures], {type: 'application/json'});
                var url = URL.createObjectURL(blob);

                // Create a download link
                var a = document.createElement('a');
                a.href = url;
                a.download = 'intersecting_features.geojson'; // Specify the filename
                document.body.appendChild(a);
                a.click();  
                document.body.removeChild(a);
            } else {
                console.log('No intersecting features found.');  //exportIntersection
            }
      });
}







// Event listener for intersect analysis button click (example)
document.getElementById('Intersection').addEventListener('click', function() {
  // Call intersectingFeatureAnalysis function to analyze intersections
  intersectingFeatureAnalysis();
});


// Function to clear intersection effects (reset styles) -------------------
function clearIntersectionEffects() {
  var features = vectorLayer.getSource().getFeatures();
  
  // Iterate through all features in the vector layer
  features.forEach(function(feature) {
      // Reset feature style to default or remove custom style
      feature.setStyle(null); // Reset to default style
  });

  console.log('Intersection effects cleared successfully');
}

// Event listener for clear intersection effects button click
document.getElementById('clearIntersectionEffects').addEventListener('click', function() {
  // Call clearIntersectionEffects function to remove intersection effects
  clearIntersectionEffects();
});





// Attribute Add and Delete --------------------------------------------------------------------------------------------------------------------------------------------

// document.getElementById('attribute').onchange = function(){
//   var attri = document.getElementById('attribute').value;

//   console.log(attri); 


// }


document.addEventListener('DOMContentLoaded', function() {
  // Get the select element for attribute manipulation
  var attributeSelect = document.getElementById('attribute');
  var dbtableDiv = document.getElementById('dbtable');
  var inputText = null;
  var selectType = null;
  var addButton = null;

  // Function to create and append elements for adding attribute
  function createAttributeElements() {
      // Create input element for attribute name
      inputText = document.createElement('input');
      inputText.type = 'text';
      inputText.id = 'attributeName'; // Assign an ID to the input
      inputText.placeholder = 'Enter attribute name'; // Optional placeholder text

      // Create select element for attribute type
      selectType = document.createElement('select');
      selectType.id = 'attributeType'; // Assign an ID to the select

      // Create options for the select element
      var optionText = document.createElement('option');
      optionText.value = 'varchar(255)';
      optionText.textContent = 'Text';
      selectType.appendChild(optionText);

      var optionNumeric = document.createElement('option');
      optionNumeric.value = 'INTEGER';
      optionNumeric.textContent = 'Numeric';
      selectType.appendChild(optionNumeric);

      var optionJson = document.createElement('option');
      optionJson.value = 'varchar(255)';
      optionJson.textContent = 'Email';
      selectType.appendChild(optionJson);

      // Create button element for adding attribute
      addButton = document.createElement('button');
      addButton.textContent = 'Add Attribute';
      addButton.id = 'addAttributeButton'; // Assign an ID to the button

      // Event listener for the Add Attribute button
      addButton.addEventListener('click', function() {
          var attributeName = inputText.value.trim();
          var attributeType = selectType.value;

          // Example validation (you can add more complex validation as needed)
          if (attributeName && attributeType) {
              // Perform addition logic here (e.g., store attribute details)
              console.log('Attribute Name:', attributeName);
              console.log('Attribute Type:', attributeType);

              // Call function to make XMLHttpRequest to server
              xhrcall(attributeName, attributeType);

              // Clear input fields after addition
              inputText.value = '';
              selectType.selectedIndex = 0; // Reset select to default option
          } else {
              alert('Please enter attribute name and select type.');
          }
      });

      // Append elements to dbtableDiv
      dbtableDiv.appendChild(inputText);
      dbtableDiv.appendChild(selectType);
      dbtableDiv.appendChild(addButton);
  }

  // Event listener for change in select element
  attributeSelect.addEventListener('change', function() {
      var selectedValue = attributeSelect.value;

      // Check if "Add Attribute" option is selected and elements are not already added
      if (selectedValue === 'Add Attribute' && !inputText && !selectType && !addButton) {
          createAttributeElements();
      } else if (selectedValue !== 'Add Attribute') {
          // If any other option is selected, remove the input and select elements
          if (inputText) {
              dbtableDiv.removeChild(inputText);
              inputText = null;
          }
          if (selectType) {
              dbtableDiv.removeChild(selectType);
              selectType = null;
          }
          if (addButton) {
              dbtableDiv.removeChild(addButton);
              addButton = null;
          }
      }
  });

  // XMLHttpRequest function to call server-side API
  function xhrcall(attributeName, attributeType) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', "http://localhost:5000/add_attribute", true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                  var response = JSON.parse(xhr.responseText);
                  alert(response.message); // Alert response from server (success or error message)
              } else {
                  alert('Error while adding column. Please try again.');
              }
          }
      };

      // Send attribute name and type as JSON payload
      xhr.send(JSON.stringify({ attributeName: attributeName, attributeType: attributeType }));
  }
});





// var xhr = new XMLHttpRequest();
//     xhr.open('GET',"http://localhost:5000/column_list",true);
//     xhr.setRequestHeader('Centent-Type','application/json');
//     xhr.onreadystatechange = function () {
//       if (xhr.readyState === 4) {
//           if (xhr.status === 200) {
//               var response = JSON.parse(xhr.responseText);
//               console.log(response.column_names); // Alert response from server (success or error message)
//           } else {
//               alert('Error while adding column. Please try again.');
//           }
//       }
//       };
//     xhr.send();



// document.addEventListener('DOMContentLoaded', function() {
//   var attributeSelect = document.getElementById('attribute');
//   var deleteAttributeSelect = document.getElementById('delete-attribute');
//   var deleteColumn = document.getElementById('deletecolumn');

//   // Function to fetch column names and populate delete attribute options
//   function populateDeleteAttributeOptions() {
//       var xhr = new XMLHttpRequest();
//       xhr.open('GET', "http://localhost:5000/column_list", true);
//       xhr.setRequestHeader('Content-Type', 'application/json');
//       xhr.onreadystatechange = function() {
//           if (xhr.readyState === 4) {
//               if (xhr.status === 200) {
//                   var response = JSON.parse(xhr.responseText);
//                   var columnNames = response.column_names; // Assuming column_names is an array of column names

//                   // Populate delete attribute options
//                   if (deleteAttributeSelect) {
//                       deleteAttributeSelect.innerHTML = ''; // Clear existing options

//                       // Create default option
//                       var defaultOption = document.createElement('option');
//                       defaultOption.value = '';
//                       defaultOption.textContent = 'Select attribute to delete';
//                       deleteAttributeSelect.appendChild(defaultOption);

//                       // Create options for each column name
//                       columnNames.forEach(function(columnName) {
//                           var option = document.createElement('option');
//                           option.value = columnName;
//                           option.textContent = columnName;
//                           deleteAttributeSelect.appendChild(option);
//                       });

//                       // Show the delete attribute select
//                       deleteAttributeSelect.style.display = 'block';
//                       deleteColumn.style.display = 'block';
//                   } else {
//                       console.error('delete-attribute select element not found.');
//                   }
//               } else {
//                   console.error('Error fetching column list:', xhr.status);
//                   alert('Error while fetching column list. Please try again.');
//               }
//           }
//       };
//       xhr.send();
//   }

//   // Event listener for change in the "Delete Attribute" select element
//   if (attributeSelect) {
//       attributeSelect.addEventListener('change', function() {
//           var selectedValue = attributeSelect.value;

//           // Check if "Delete Attribute" is selected
//           if (selectedValue === 'Delete Attribute') {
//               // Populate options and show the delete attribute select
//               populateDeleteAttributeOptions();
//           } else {
//               // Hide the delete attribute select
//               deleteAttributeSelect.style.display = 'none';
//               deleteColumn.style.display = 'none';
//           }
//       });
//   } else {
//       console.error('attribute select element not found.');
//   }



//   document.getElementById('deletecolumn').addEventListener('click',function(){
//     console.log('Yes consoled');

//     var delete_value = document.getElementById('delete-attribute').value;
//     console.log(delete_value);


//     var xhr = new XMLHttpRequest();
//         xhr.open('POST','http://localhost:5000/drop_column',true);
//         xhr.setRequestHeader('Content-Type','application/json');
//         xhr.onreadystatechange = function () {
//           if (xhr.readyState === 4) {
//               if (xhr.status === 200) {
//                   var response = JSON.parse(xhr.responseText);
//                   // alert(response.message); // Alert response from server (success or error message)
//               } else {
//                   alert('Error while drop column. Please try again.');
//               }
//           }
//       };
//         xhr.send(JSON.stringify({ columnName: delete_value }));

//   })

// });





document.addEventListener('DOMContentLoaded', function() {
  var attributeSelect = document.getElementById('attribute');
  var deleteAttributeSelect = document.getElementById('delete-attribute');
  var deleteColumn = document.getElementById('deletecolumn');

  // Function to fetch column names and populate delete attribute options
  function populateDeleteAttributeOptions() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', "http://localhost:5000/column_list", true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                  var response = JSON.parse(xhr.responseText);
                  var columnNames = response.column_names; // Assuming column_names is an array of column names

                  // Populate delete attribute options
                  if (deleteAttributeSelect) {
                      deleteAttributeSelect.innerHTML = ''; // Clear existing options

                      // Create default option
                      var defaultOption = document.createElement('option');
                      defaultOption.value = '';
                      defaultOption.textContent = 'Select attribute to delete';
                      deleteAttributeSelect.appendChild(defaultOption);

                      // Create options for each column name
                      columnNames.forEach(function(columnName) {
                          var option = document.createElement('option');
                          option.value = columnName;
                          option.textContent = columnName;
                          deleteAttributeSelect.appendChild(option);
                      });

                      // Show the delete attribute select
                      deleteAttributeSelect.style.display = 'block';
                  } else {
                      console.error('delete-attribute select element not found.');
                  }
              } else {
                  console.error('Error fetching column list:', xhr.status);
                  alert('Error while fetching column list. Please try again.');
              }
          }
      };
      xhr.send();
  }

  // Event listener for change in the "attribute" select element
  if (attributeSelect) {
      attributeSelect.addEventListener('change', function() {
          var selectedValue = attributeSelect.value;

          // Check if "Delete Attribute" is selected
          if (selectedValue === 'Delete Attribute') {
              // Populate options and show the delete attribute select
              populateDeleteAttributeOptions();
              deleteColumn.style.display = 'block'; // Show the delete button
          } else {
              // Hide the delete attribute select and delete button
              deleteAttributeSelect.style.display = 'none';
              deleteColumn.style.display = 'none';
          }
      });
  } else {
      console.error('attribute select element not found.');
  }

  // Event listener for delete button click
  if (deleteColumn) {
      deleteColumn.addEventListener('click', function() {
          var delete_value = deleteAttributeSelect.value;

          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'http://localhost:5000/drop_column', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                      var response = JSON.parse(xhr.responseText);
                      alert(response.message); // Alert response from server (success or error message)
                  } else {
                      alert('Error while dropping column. Please try again.');
                  }
              }
          };
          xhr.send(JSON.stringify({ columnName: delete_value }));
      });
  } else {
      console.error('deletecolumn button element not found.');
  }
});

    


// Add Attibute ---------------------------------------------------------------------------------------------


// document.getElementById('addAttributeButton').addEventListener('click', function(){
//   console.log('this is add Attribute code here');
// })






















