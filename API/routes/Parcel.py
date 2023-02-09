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

with open('helpers\\columns.json', 'r') as JSON:
       column_dict = json.load(JSON)

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
        parcel_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        parcel_details = pd.DataFrame(parcel_details)

        # Change data format for selected columns
        cols_date = ['INVESTMENT_DATE', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 'PREMIUM_EFFECTIVE_DATE', 'LATEST_SALE_DATE', 'LATEST_ARMS_LENGTH_SALE_DATE', 'PRIOR_ARMS_LENGTH_SALE_DATE', 'LOAN1_DUE_DATE', 'CREATE_DATE', 'LAST_MODIFY_DATE']
        for i in cols_date:
            parcel_details[i] = pd.to_datetime(parcel_details[i]).dt.strftime("%d %b, %Y").astype(str)

        parcel_details = parcel_details.rename(columns=column_dict)
        parcel_details = parcel_details.to_dict(orient='records')

        mycursor = mydb.cursor()
        mycursor.execute(parcel_query['GET_PARCEL_FEES_BY_ID'].format(ID = parcel_id))
        parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]

        response_dict = {
            "parcel_details": parcel_details,
            "parcel_fees": parcel_fees
        }
        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500



# Update Parcel status
@parcel_blueprint.route("/api/v1/parcel/<parcel_id>/<status>", methods=['PUT'])
@token_required
def update_parcel_status(current_user, parcel_id, status):
    # Update the parcel status
    try:
        mycursor = mydb.cursor()
        mycursor.execute(parcel_query['UPDATE_STATUS_BY_ID'].format(ID = parcel_id, STATUS = status))
        mydb.commit()
        mycursor.close()
        return jsonify({"message": "Parcel status updated successfully!"}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500
