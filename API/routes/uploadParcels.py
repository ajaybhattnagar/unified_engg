from flask import Flask, request, jsonify, json, Blueprint
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import jwt
from sqlalchemy import create_engine
from utils import check_user, get_user_details


upload_parcels_blueprint = Blueprint('upload_parcels_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

engine = create_engine(configData['engine_url'])


try:
    mydb = mysql.connector.connect(
        host = configData['host'],
        user = configData['user'],
        password = configData['password'],
        database = configData['database']
    )
except mysql.connector.Error as err:
   print("Something went wrong: {}".format(err))



# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        # ensure the jwt-token is passed with the headers
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token: # throw error if no token provided
            return jsonify({"message": "A valid token is missing!"}), 401
        try:
           # decode the token to obtain user public_id
            data = jwt.decode(token, configData['jwt_secret'], algorithms=['HS256'])
            current_user = get_user_details(data['EMAIL'])
        except:
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(current_user, *args, **kwargs)
    return decorator


# Register API
@upload_parcels_blueprint.route("/api/v1/upload_parcels", methods=['POST'])
@token_required
def upload_parcels(token):
    # content = request.get_json(silent=True)
    # email = content['EMAIL'],
    # password = content['PASSWORD'],

    df = pd.read_csv('E:\Bob - SDA\data.csv')
    # df['UNIQUE_ID'] = np.random(1000000000, 9999999999, size=len(df)
    df.to_sql('PARCELS', engine, if_exists='append', index=False)

    return jsonify({"message": "Something went wrong. Please try again later."}), 500

