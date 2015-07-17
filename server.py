import collections
import json
import math
import psycopg2

from datetime import datetime

from flask import Flask
from flask import render_template
from flask import request
from flask import Response

app = Flask(__name__)

metres2degrees = (2.0 * math.pi * 6378137.0) / 360.0
tile_width = 78271.52  # Standard width of a single 256 pixel map tile at zoom level one


@app.route("/")
def homepage():
    return render_template('index.html')


@app.route("/geojson")
def bdys():

    start_time = datetime.now()

    # Get parameters from querystring
    map_left = request.args.get('ml')
    map_bottom = request.args.get('mb')
    map_right = request.args.get('mr')
    map_top = request.args.get('mt')
    zoom_level = int(request.args.get('z'))
    table_name = request.args.get('t')

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
    except psycopg2.Error:
        return "Unable to connect to the database."

    cur = conn.cursor()

    # The query
    sql = "SELECT sa1_7digit AS id, state_name AS state, ST_AsGeoJSON(ST_SnapToGrid(geom, {0}), {1}, 0) FROM {2} " \
          "WHERE ST_Intersects(ST_SetSRID(ST_MakeBox2D(ST_Point({3}, {4}), ST_Point({5}, {6})), 0),geom)"\
        .format(float(grid_string), places, table_name, map_left, map_bottom, map_right, map_top)

    try:
        cur.execute(sql)
    except psycopg2.Error:
        return "I can't SELECT : " + sql

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

    output = ''.join(['{"type":"FeatureCollection","features":', gj, '}'])

    end_time = datetime.now()

    print "Data prep took " + (end_time - start_time)

    return Response(output, mimetype='application/json')


if __name__ == '__main__':
    app.debug = True
    # app.run(host='0.0.0.0', port=81)
    app.run(port=81)
