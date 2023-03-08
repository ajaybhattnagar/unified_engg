from flask import Flask, request, jsonify, json, Blueprint, Response
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
import warnings
warnings.filterwarnings('ignore')
import bcrypt
import jwt
from utils import check_user, get_user_details
from helpers.function import get_total_penalty, get_total_interest, get_total_days_of_interest

from queries.reports_query import reports_query

reports_blueprint = Blueprint('reports_blueprint', __name__)

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


@reports_blueprint.route('/api/v1/reports/all_fields', methods=['GET'])
@token_required
def all_fields(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['GET_ALL_FIELDS_REPORT'])
        all_parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        all_parcel_fees = pd.DataFrame.from_dict(all_parcel_fees)

        # Create a new dataframe to store the results
        results_df = pd.DataFrame()

        # Get the unique parcel ids
        unique_parcel_ids = all_parcel_fees['UNIQUE_ID'].unique()

        # Loop through the unique parcel ids
        for i in unique_parcel_ids:
            total_interest = []
            total_days_of_interest = []
            df = all_parcel_fees[all_parcel_fees['UNIQUE_ID'] == i]
            
            # Get the total penalty
            total_penalty = get_total_penalty(df.iloc[0]['BEGINNING_BALANCE'], df.iloc[0]['AMOUNT'], 'false')
            df['TOTAL_PENALTY'] = total_penalty

            # Get the total interest
            for i in np.arange(0, len(df)):
                if df.iloc[i]['CATEGORY'] > 2:
                    ti = get_total_interest(df.iloc[i]['AMOUNT'], df.iloc[i]['INTEREST'], df.iloc[i]['EFFECTIVE_DATE'], df.iloc[i]['EFFECTIVE_END_DATE'])
                    td = get_total_days_of_interest(df.iloc[i]['EFFECTIVE_DATE'], df.iloc[i]['EFFECTIVE_END_DATE'])
                else :
                    ti = 0
                    td = 0
                total_interest.append(ti)
                total_days_of_interest.append(td)
            
            df['TOTAL_DAYS_OF_INTEREST'] = total_days_of_interest
            df['TOTAL_INTEREST'] = total_interest

            # Append to the results dataframe
            results_df = pd.concat([results_df, df], ignore_index=True)

        # Convert the date columns to datetime
        results_df['EFFECTIVE_DATE'] = pd.to_datetime(results_df['EFFECTIVE_DATE'])
        results_df['EFFECTIVE_END_DATE'] = pd.to_datetime(results_df['EFFECTIVE_END_DATE'])

        # results_df.to_excel('all_fields.xlsx', index=False)

        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=results_df.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500
