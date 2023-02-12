from flask import Flask, request, jsonify, json
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt
from utils import check_user, get_user_details

from routes.login import login_blueprint
from routes.Parcels import parcels_blueprint
from routes.Parcel import parcel_blueprint
from routes.Notes import notes_blueprint


app = Flask(__name__)
app.register_blueprint(login_blueprint)
app.register_blueprint(parcels_blueprint)
app.register_blueprint(parcel_blueprint)
app.register_blueprint(notes_blueprint)

CORS(app)

with open ('config.json') as f:
    configData = json.load(f)

@app.route("/")
def welcome():
    return ("Welcome to API.")



if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5000)
    app.run(debug=True)
    app.run(host='0.0.0.0', port=2277)
