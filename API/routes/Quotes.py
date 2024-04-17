from flask import Flask, request, jsonify, json, Blueprint, Response, send_file
from flask_cors import CORS
from functools import wraps
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
import bcrypt
import jwt
import pyodbc 
from queries.quotes import quote_query

import os
from utils import list_files, send_email, allowedFile, save_base64_to_image


quotes_blueprint = Blueprint('quotes_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

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
            username = str(data['USERNAME'])
            data = str(data['CONNECTION_STRING'])
        except Exception as e:
            print (e)
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(data, username , *args, **kwargs)
    return decorator

@quotes_blueprint.route("/api/v1/quotes/new_quote_details", methods=['GET'])
@token_required
def indirect_codes(connection_string, username):
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(quote_query['GET_ALL_ACTIVE_CUSTOMERS'])
        active_customers = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(quote_query['GET_SALES_REP'])
        sales_rep = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(quote_query['GET_TERRITORY'])
        territory = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(quote_query['GET_FOB_POINT'])
        fob = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(quote_query['GET_SHIP_VIA'])
        ship_via = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]


        sql.close()

        response_dict = {
            "CUSTOMERS": active_customers,
            "SALES_REP": sales_rep,
            "TERRITORY": territory,
            "FOB_POINT": fob,
            "SHIP_VIA": ship_via
        }
        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
@quotes_blueprint.route("/api/v1/details/site_warehouse", methods=['GET'])
@token_required
def site_warehouse(connection_string, username):
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
