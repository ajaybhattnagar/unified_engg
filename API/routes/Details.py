from flask import Flask, request, jsonify, json, Blueprint, Response
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
import bcrypt
import jwt
import pyodbc 
from queries.details import details_query


details_blueprint = Blueprint('details_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

def connect_database(user):
    try:
        mydb = mysql.connector.connect(
            host = configData['host'],
            user = user,
            password = configData['db_user_password'],
            database = configData['database']
        )
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    return mydb


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
            data = str(data['CONNECTION_STRING'])
        except:
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(data, *args, **kwargs)
    return decorator

@details_blueprint.route("/api/v1/details/indirectcodes", methods=['GET'])
@token_required
def indirect_codes(connection_string):
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_INDIRECT_CODES'])
        results = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        sql.close()
        response = Response(
                    response=simplejson.dumps(results, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
@details_blueprint.route("/api/v1/details/site_warehouse", methods=['GET'])
@token_required
def site_warehouse(connection_string):
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_SITES'])
        sites = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(details_query['GET_WAREHOUSES'])
        warehouses = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.close()

        response_dict = {
            "SITES": sites,
            "WAREHOUSES": warehouses
        }
        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401

