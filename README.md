# draw-features-with-reference-openlayers

# Web GIS Application with PostgreSQL and PostGIS

This web application allows users to draw features, collect attributes such as name and district, and perform spatial operations using PostgreSQL with PostGIS.

## Features

- **Draw Feature:** Users can draw points, lines, or polygons on the map.
- **Attribute Collection:** Users can enter attributes (e.g., name, district) for the drawn features.
- **Save to Database:** Save the drawn features along with their attributes to PostgreSQL using PostGIS queries.
- **Popup on Selection:** Clicking on a drawn feature displays a popup with its attributes.
- **Delete Features:** Users can delete selected features from the map.
- **Buffer Operation:** Perform buffer operations around selected features.
- **Intersection:** Perform intersection queries with other spatial datasets.
- **Export Data:** Export spatial data to various formats (e.g., GeoJSON, KML).
- **Manage Database Schema:** Add or delete columns in the PostgreSQL database.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript (Leaflet.js for mapping library)
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL with PostGIS
- **GIS Operations:** PostGIS for spatial queries and operations

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your/repository.git
   cd repository
