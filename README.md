# Web GIS Application with PostgreSQL and PostGIS

This web application allows users to draw features, collect attributes such as name and district, and perform spatial operations like Buffer, Intersect etc.



![Application Screenshot](https://github.com/92sagarchougule/draw-features-with-reference-openlayers/blob/main/images/Digitize.jpg "Application Screenshot")



## Features

- **Draw Feature:** Users can draw points, lines, or polygons on the map.
- **Attribute Collection:** Users can enter attributes (e.g., name, district) for the drawn features.
- **Save to Database:** Save the drawn features along with their attributes to PostgreSQL using PostGIS queries.
- **Popup on Selection:** Clicking on a drawn feature displays a popup with its attributes.
- **Delete Features:** Users can delete selected features from the map.
- **Buffer Operation:** Perform buffer operations around selected features.
- **Intersection:** Perform intersection queries with other spatial datasets.
- **Export Data:** Export spatial data to various formats (e.g., GeoJSON).
- **Manage Database Schema:** Add or delete columns in the PostgreSQL database.


![Application Screenshot](https://github.com/92sagarchougule/draw-features-with-reference-openlayers/blob/main/images/Capture.JPG "Application Screenshot")

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript (OpenLayers.js for mapping library)
- **Backend:** Python (psycopg2, Flask)
- **Database:** PostgreSQL with PostGIS
- **GIS Operations:** PostGIS for spatial queries and operations

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/92sagarchougule/Web-GIS-Application-with-PostgreSQL-and-PostGIS.git
   cd repository
   
3. **Database Setup::**

   ```sql
	CREATE DATABASE your_database;
	\c your_database
	CREATE EXTENSION postgis;

3. **Create Table::**

   ```sql
	CREATE TABLE your_table_name (
    	id SERIAL PRIMARY KEY,
    	geom geometry(Geometry,4326), -- Geometry field using EPSG:4326 (WGS 84)
    	dist VARCHAR(255),             -- District field (adjust size as needed)
    	name VARCHAR(255)              -- Name field (adjust size as needed)
	);
   
- Ensure PostgreSQL and PostGIS are installed.
- Create a new database and enable PostGIS extension:


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built using Python, PostgreSQL, PostGIS, OpenLayers, and other open-source technologies.

## Support

For support, **[contact](sagar4gis@gmail.com)**

## Roadmap

- **Version 1.1:** Enhance drawing tools for better user interaction.
- **Version 1.2:** Integrate more spatial analysis functions.
- **Version 1.3:** Improve UI/UX for easier navigation and data management.

## Authors

- **Sagar Chougule** - https://github.com/92sagarchougule/


## Feedback

Feel free to send feedback or report issues **[here](https://github.com/92sagarchougule/Web-GIS-Application-with-PostgreSQL-and-PostGIS/issues.)**





   
   
