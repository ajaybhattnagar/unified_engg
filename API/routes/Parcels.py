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


parcels_blueprint = Blueprint('parcels_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

engine = create_engine(configData['engine_url'])


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
            current_user = get_user_details(data['EMAIL'])
            user_email = data['EMAIL']
        except:
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(user_email, *args, **kwargs)
    return decorator


# Upload parcels
@parcels_blueprint.route("/api/v1/upload_parcels", methods=['POST'])
@token_required
def upload_parcels(current_user):
    content = request.get_json(silent=True)
    df = pd.DataFrame.from_dict(content)
    df = df[df['TSRID'].isnull() == False]
    df['UNIQUE_ID'] = np.random.randint(0,999999999, size=len(df))

    try:
        df.to_sql('PARCELS', engine, if_exists='append', index=False)
        return jsonify({"message": "Parcels uploaded successfully."}), 200
    except:
        return jsonify({"message": 'Failed'}), 500


# search parcels
@parcels_blueprint.route("/api/v1/search_parcels", methods=['GET'])
@token_required
def search_parcels(current_user):
    connection = connect_database(current_user)

    searchString = request.args.get('searchString')
    searchString = "%" + searchString + "%"

    try:
        mycursor = connection.cursor()
        mycursor.execute(parcel_query['SEARCH_PARCEL'].format(TEXT=searchString))
        myresult = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        connection.commit()
        mycursor.close()
        response = Response(
                response=simplejson.dumps(myresult, ignore_nan=True,default=datetime.datetime.isoformat),
                mimetype='application/json'
            )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500


@parcels_blueprint.route("/api/v1/get_distinct_filters", methods=['GET'])
@token_required
def get_distinct_filters(current_user):
    connection = connect_database(current_user)
    mycursor = connection.cursor()
    try:
        mycursor.execute(parcel_query['GET_DISTINCT_STATES'])
        states = [item[0] for item in mycursor.fetchall()]

        mycursor.execute(parcel_query['GET_DISTINCT_COUNTY'])
        counties = [item[0] for item in mycursor.fetchall()]

        mycursor.execute(parcel_query['GET_DISTINCT_MUNICIPALITY'])
        municipalities = [item[0] for item in mycursor.fetchall()]

        connection.commit()
        mycursor.close()

        return jsonify({"states": states, "counties": counties, "municipalities": municipalities}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500


@parcels_blueprint.route("/api/v1/get_parcels_based_on_filters", methods=['GET'])
@token_required
def get_parcels_based_on_filters(current_user):
    connection = connect_database(current_user)

    if request.args.get('state') is not None:
        state = request.args.get('state')
        state = "%" + state + "%"
    else:
        state = "%%"
    
    if request.args.get('county') is not None:
        county = request.args.get('county')
        county = " AND COUNTY LIKE '%" + county + "%'"
    else:
        county = ""
    
    if request.args.get('municipality') is not None:
        municipality = request.args.get('municipality')
        municipality = " AND MUNICIPALITY LIKE '%" + municipality + "%'"
    else:
        municipality = ""

    if request.args.get('status') is not None:
        status = request.args.get('status')
        status = " AND STATUS = '" + status + "'"
    else:
        status = ""
        
    try:
        mycursor = connection.cursor()
        mycursor.execute(parcel_query['GET_PARCELS_BASED_ON_FILTERS'].format(STATE=state, COUNTY=county, MUNICIPALITY=municipality, STATUS=status))
        myresult = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        connection.commit()
        mycursor.close()
        response = Response(
                response=simplejson.dumps(myresult, ignore_nan=True,default=datetime.datetime.isoformat),
                mimetype='application/json'
            )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500
