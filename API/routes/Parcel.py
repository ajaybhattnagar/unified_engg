from flask import Flask, request, jsonify, json, Blueprint, Response
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import jwt
import datetime
from datetime import date
import simplejson
from sqlalchemy import create_engine
from utils import check_user, get_user_details
from queries.parcel_query import parcel_query
import random, string


parcel_blueprint = Blueprint('parcel_blueprint', __name__)

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

@parcel_blueprint.route("/api/v1/parcel/<parcel_id>", methods=['GET'])
@token_required
def get_parcel(current_user, parcel_id):
    # Get the parcel details
    try:
        mycursor = mydb.cursor()
        mycursor.execute(parcel_query['GET_PARCEL_BY_ID'].format(ID = parcel_id))
        myresult = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        response = Response(
                    response=simplejson.dumps(myresult, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500