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
from helpers.function import get_total_penalty, get_total_interest, get_total_days_of_interest


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

def get_parcel_details(parcel_id):
    mycursor = mydb.cursor()
    mycursor.execute(parcel_query['GET_PARCEL_BY_ID'].format(ID = parcel_id))
    parcel_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
    parcel_details = pd.DataFrame(parcel_details)

    # Change data format for selected columns
    cols_date = ['INVESTMENT_DATE', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 'PREMIUM_EFFECTIVE_DATE', 'LATEST_SALE_DATE', 'LATEST_ARMS_LENGTH_SALE_DATE', 'PRIOR_ARMS_LENGTH_SALE_DATE', 'LOAN1_DUE_DATE', 'CREATE_DATE', 'LAST_MODIFY_DATE']
    for i in cols_date:
        parcel_details[i] = pd.to_datetime(parcel_details[i]).dt.strftime("%d %b, %Y").astype(str)

    parcel_details = parcel_details.rename(columns=column_dict)
    mydb.commit()
    mycursor.close()
    return (parcel_details)


@parcel_blueprint.route("/api/v1/parcel/<parcel_id>", methods=['GET'])
@token_required
def get_parcel(current_user, parcel_id):
    # Get the parcel details    
    try:
      
        # Get the parcel details
        parcel_details = get_parcel_details(parcel_id)
        parcel_details = parcel_details.to_dict(orient='records')

        mycursor = mydb.cursor()
        mycursor.execute(parcel_query['GET_PARCEL_FEES_BY_ID'].format(ID = parcel_id))
        parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]

        mydb.commit()
        mycursor.close()

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


# Update Parcel fees
@parcel_blueprint.route("/api/v1/parcel/update_fee", methods=['POST'])
@token_required
def update_parcel_fees(token):
    # Update the parcel fees
    try:
        content = request.get_json(silent=True)
        if content['EFFECTIVE_END_DATE'] == '':
            content['EFFECTIVE_END_DATE'] = 'NULL'

        mycursor = mydb.cursor()
        mycursor.execute(parcel_query['UPDATE_FEES_BY_ID'].format(ID = content['ID'], CATEGORY = content['CATEGORY'], DESCRIPTION = content['DESCRIPTION'], 
            AMOUNT = content['AMOUNT'], INTEREST = content['INTEREST'], EFFECTIVE_DATE = content['EFFECTIVE_DATE'], EFFECTIVE_END_DATE= content['EFFECTIVE_END_DATE'] ))
        mydb.commit()
        mycursor.close()

        return jsonify({"message": "Parcel fees updated successfully!"}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500


# Delete Parcel fees
@parcel_blueprint.route("/api/v1/parcel/delete_fee/<fee_id>", methods=['DELETE'])
@token_required
def delete_parcel_fees(current_user, fee_id):
    # Delete the parcel fees
    try:
        mycursor = mydb.cursor()
        mycursor.execute(parcel_query['DELETE_FEES_BY_ID'].format(ID = fee_id))
        mydb.commit()
        mycursor.close()

        return jsonify({"message": "Parcel fees deleted successfully!"}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500


# Add Parcel fees
@parcel_blueprint.route("/api/v1/parcel/add_fee", methods=['POST'])
@token_required
def add_parcel_fees(current_user):

    # try:
    content = request.get_json(silent=True)
    if content['CATEGORY'] == '':
        return jsonify({"message": "Category is required!"}), 500
    if content['DESCRIPTION'] == '':
        content['DESCRIPTION'] = 'NULL'
    if content['AMOUNT'] == '':
        return jsonify({"message": "Amount is required!"}), 500
    if content['INTEREST'] == '':
        return jsonify({"message": "Interest is required!"}), 500
    if content['EFFECTIVE_DATE'] == '':
        return jsonify({"message": "Effective date is required!"}), 500
    if content['EFFECTIVE_END_DATE'] == '':
        content['EFFECTIVE_END_DATE'] = 'NULL'
    
    mycursor = mydb.cursor()
    mycursor.execute(parcel_query['INSERT_FEES_BY_UNIQUE_ID'].format(UNIQUE_ID = content['UNIQUE_ID'], CATEGORY = content['CATEGORY'], DESCRIPTION = content['DESCRIPTION'], 
        AMOUNT = content['AMOUNT'], INTEREST = content['INTEREST'], EFFECTIVE_DATE = content['EFFECTIVE_DATE'], EFFECTIVE_END_DATE= content['EFFECTIVE_END_DATE'] ))
    mydb.commit()
    mycursor.close()

    return jsonify({"message": "Parcel fees added successfully!"}), 200
    # except:
    #     return jsonify({"message": "Something went wrong!"}), 500


@parcel_blueprint.route("/api/v1/parcel/<parcel_id>/payoff_report", methods=['GET'])
@token_required
def get_payoff_report(current_user, parcel_id):
    end_date = request.args.get('endDate')
    # print (end_date, parcel_id)
    mycursor = mydb.cursor()
    try:
    # Get the parcel details
        mycursor.execute(parcel_query['GET_PARCEL_FEES_BY_ID_PAYOFF_REPORT'].format(ID = parcel_id))
        parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        parcel_fees = pd.DataFrame.from_dict(parcel_fees)
        
        #  Get the total penalty
        total_penalty = get_total_penalty(parcel_fees.iloc[0]['BEGINNING_BALANCE'], parcel_fees.iloc[0]['AMOUNT'], 'false')

    except:
        return jsonify({"message": "Failed while querying data or calculating total penalty."}), 500

    # Get the total interest
    try:
        total_interest = []
        total_days_of_interest = []
        for i in np.arange(0, len(parcel_fees)):
            # tp = get_total_penalty(parcel_fees.iloc[i]['BEGINNING_BALANCE'], parcel_fees.iloc[i]['AMOUNT'], 'false')
            if parcel_fees.iloc[i]['CATEGORY'] > 2:
                ti = get_total_interest(parcel_fees.iloc[i]['AMOUNT'], parcel_fees.iloc[i]['INTEREST'], parcel_fees.iloc[i]['EFFECTIVE_DATE'], end_date)
                td = get_total_days_of_interest(parcel_fees.iloc[i]['EFFECTIVE_DATE'], end_date)
            else :
                ti = 0
                td = 0
            total_interest.append(ti)
            total_days_of_interest.append(td)

        parcel_fees['TOTAL_DAYS_OF_INTEREST'] = total_days_of_interest
        parcel_fees['TOTAL_INTEREST'] = total_interest
        parcel_fees['TOTAL_AMOUNT'] = 0
        parcel_fees['PAYMENTS_RECIEVED'] = 0
        parcel_fees = parcel_fees[['CATEGORY', 'AMOUNT', 'INTEREST', 'EFFECTIVE_DATE', 'TOTAL_DAYS_OF_INTEREST', 'TOTAL_INTEREST', 'PAYMENTS_RECIEVED', 'TOTAL_AMOUNT']]
        # Change the data type of the columns
        parcel_fees[["AMOUNT", "INTEREST" ]] = parcel_fees[["AMOUNT", "INTEREST"]].apply(pd.to_numeric)
        parcel_fees['TOTAL_AMOUNT'] = round(parcel_fees['AMOUNT'] + parcel_fees['TOTAL_INTEREST'],2)
        
        summary_row = ['Total', round(parcel_fees['AMOUNT'].sum(),2), round(parcel_fees['INTEREST'].sum(),2), '', '', round(parcel_fees['TOTAL_INTEREST'].sum(),2), round(parcel_fees['PAYMENTS_RECIEVED'].sum(),2), round(parcel_fees['TOTAL_AMOUNT'].sum(),2)]
        summary_row = pd.DataFrame([summary_row], columns = parcel_fees.columns)
        parcel_fees = pd.concat([parcel_fees, summary_row])


        principal = parcel_fees[parcel_fees['CATEGORY'] == 1]['AMOUNT'].sum()
        overbid = parcel_fees[parcel_fees['CATEGORY'] == 2]['AMOUNT'].sum()
        penalty = total_penalty
        sub_taxes = parcel_fees[(parcel_fees['CATEGORY'] != 1) & (parcel_fees['CATEGORY'] != 2) & (parcel_fees['CATEGORY'] != 'Total')]['AMOUNT'].sum()
        sub_taxes_interest = parcel_fees[(parcel_fees['CATEGORY'] != 1) & (parcel_fees['CATEGORY'] != 2) & (parcel_fees['CATEGORY'] != 'Total')]['TOTAL_INTEREST'].sum()
        total = round(principal + overbid + penalty + sub_taxes + sub_taxes_interest,2)
        payment_recieved = round(parcel_fees[parcel_fees['CATEGORY'] == 'Total']['PAYMENTS_RECIEVED'].sum(),2)
        balance = round(total - payment_recieved,2)

        summary_dict = {
                'PRINCIPAL': str(principal),
                'OVERBID': str(overbid),
                'PENALTY': str(penalty),
                'SUB_TAXES': str(sub_taxes),
                'SUB_TAXES_INTEREST': str(sub_taxes_interest),
                'TOTAL': str(total),
                'PAYMENT_RECIEVED': str(payment_recieved),
                'BALANCE': str(balance)
            }

        mydb.commit()
        mycursor.close()
    except:
        return jsonify({"message": "Failed while calculating total interest."}), 500

    try:
        # Get the parcel details
        parcel_details = get_parcel_details(parcel_id)
        response_dict = {
                "parcel_details": parcel_details.to_dict(orient='records'),
                "parcel_fees": parcel_fees.to_dict(orient='records'),
                "parcel_summary": [summary_dict]
            }
        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True, default=datetime.date.isoformat),
                    mimetype='application/json'
        )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except:
        return jsonify({"message": "Failed while generating report data."}), 500
   
