from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
# import logging



app = Flask(__name__)
# logging.basicConfig(level=logging.DEBUG) 
CORS(app)  # Enable CORS for all routes

# Database connection parameters
host = 'localhost'
dbname = 'mydb'
user = 'postgres'
password = '123'

@app.route('/save_feature', methods=['POST'])
def save_feature():
    # try:
        # Connect to PostgreSQL database
    conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)
    cursor = conn.cursor()

    # Get geometry and name from request JSON
    data = request.get_json()
    geometry = data.get('geometry')
    name = data.get('name')
    dist = data.get('distText')

    # Prepare SQL statement to insert GeoJSON geometry into PostgreSQL
    sql = "INSERT INTO features (name, dist, geometry) VALUES (%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326))"
    cursor.execute(sql, (name, dist, geometry))

    # Commit the transaction
    conn.commit()

    # Close database connections
    cursor.close()
    conn.close()

    # Send response back to client (success message)
    return jsonify({"message": f"{name} saved successfully in Database."}), 200

    # except psycopg2.Error as e:
    #     # Handle database errors
    #     return jsonify({"error": str(e)}), 500 
    

@app.route('/delete_feature', methods=['POST'])
def delete_feature():
    # try:
    #     # Connect to PostgreSQL database
    conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)
    cursor = conn.cursor()

    # Get data from request JSON (assuming you pass the name)
    data = request.get_json()
    nameText = data.get('name')

    # Prepare SQL statement to delete feature based on name
    sql = "DELETE FROM features WHERE name = %s"
    cursor.execute(sql, (nameText,))

    # Commit the transaction
    conn.commit()

    # Close database connections
    cursor.close()
    conn.close()

    # Send response back to client (success message)
    return jsonify({"message": f"{nameText} Deleted successfully from Database."}), 200

    # except psycopg2.Error as e:
    #     # Handle database errors
    #     return jsonify({"error": str(e)}), 500
    

@app.route('/add_attribute', methods=['POST'])
def add_attribute():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)
        cursor = conn.cursor()

        # Get data from request JSON
        data = request.get_json()
        attname = data.get('attributeName')
        attdtype = data.get('attributeType')

        # Prepare SQL statement to add column to table
        sql = f"ALTER TABLE features ADD COLUMN {attname} {attdtype}"

        # Execute SQL statement
        cursor.execute(sql)

        # Commit the transaction
        conn.commit()

        # Close database connections
        cursor.close()
        conn.close()

        # Send response back to client (success message)
        return jsonify({"message": f"{attname} column added successfully to 'features' table."}), 200

    except psycopg2.Error as e:
        # Handle database errors
        return jsonify({"error": str(e)}), 500
    


@app.route('/column_list', methods=['GET'])
def column_list():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)
        cursor = conn.cursor()

        
        

        # Prepare SQL statement to select column names
        sql = """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'features';
        """

        # Execute SQL statement
        cursor.execute(sql)

        # Fetch all rows
        columns = cursor.fetchall()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Prepare response JSON with column names
        column_names = [column[0] for column in columns]
        return jsonify({"column_names": column_names}), 200

    except psycopg2.Error as e:
        # Handle database errors
        return jsonify({"error": str(e)}), 500
    

@app.route('/drop_column', methods=['POST'])
def drop_column():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(host=host, dbname=dbname, user=user, password=password)
        cursor = conn.cursor()

        # Get data from request JSON
        data = request.get_json()
        columnName = data.get('columnName')

        # Validate input (optional)
        if not columnName:
            return jsonify({"error": "columnName parameter is required"}), 400

        # Prepare SQL statement to drop column from table
        sql = f"ALTER TABLE features DROP COLUMN {columnName}"

        # Execute SQL statement
        cursor.execute(sql)

        # Commit the transaction
        conn.commit()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Prepare response JSON
        return jsonify({"message": f"Column '{columnName}' dropped successfully"}), 200

    except psycopg2.Error as e:
        # Handle database errors
        return jsonify({"error": str(e)}), 500

        

if __name__ == '__main__':
    app.run(debug=True)
