import collections
import json
import math
import os
import psycopg2

from flask import Flask
app = Flask(__name__)

metres2degrees = (2.0 * math.pi * 6378137.0) / 360.0
tile_width = 78271.52  # Standard width of a single 256 pixel map tile at zoom level one


@app.route("/")
def hello():
    # Get parameters from querystring
    qs = urlparse.parse_qs(os.environ.get('QUERY_STRING'))
    map_left = qs.get('ml')[0]
    map_bottom = qs.get('mb')[0]
    map_right = qs.get('mr')[0]
    map_top = qs.get('mt')[0]
    zoom_level = int(qs.get('z')[0])
    table_name = qs.get('t')[0]

    # Set the number of decimal places for the output GeoJSON to reduce response size & speed up rendering
    tolerance = (tile_width / math.pow(2.0, float(zoom_level))) / metres2degrees
    places = 0
    precision = 0.1
    grid_string = "0."

    while precision > tolerance:
        places += 1
        precision /= 10
        grid_string += "0"

    places += 1
    grid_string += "1"

    # print str(places)
    # print grid_string

    # Try to connect to Postgres
    try:
        conn = psycopg2.connect("dbname='abs_2011' user='postgres' password='password'")
    except:
        return "Unable to connect to the database."

    cur = conn.cursor()

    # The query
    sql = "SELECT gid, pif, ST_AsGeoJSON(ST_SnapToGrid(geom, %s), %s, 0) FROM dl_geospatial.%s " \
          "WHERE ST_Intersects(ST_SetSRID(ST_MakeBox2D(ST_Point(%s, %s), ST_Point(%s, %s)), 4283),geom)"

    # sql = "SELECT gid, pif, ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, %s), %s, 0) " \
    #       "FROM dl_geospatial.vw_iag_pif_hex_grid_%s"

    try:
        cur.execute(sql % (float(grid_string), places, table_name, map_left, map_bottom, map_right, map_top))
    except psycopg2.Error:
        return "I can't SELECT" + sql

    # Create the GeoJSON output with an array of dictionaries containing the field names and values
    rows = cur.fetchall()
    dicts = []

    for row in rows:
        rec = collections.OrderedDict()
        rec['type'] = 'Feature'

        props = collections.OrderedDict()
        props['id'] = row[0]
        props['count'] = row[1]

        rec['properties'] = json.dumps(props)
        rec['geometry'] = row[2]

        dicts.append(rec)

    gj = json.dumps(dicts).replace(" ", "").replace("\\", "").replace('"{', '{').replace('}"', '}')

    # Output
    return ''.join(['{"type":"FeatureCollection","features":', gj, '}'])


if __name__ == "__main__":
    app.run()
