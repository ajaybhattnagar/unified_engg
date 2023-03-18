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
    

# Report Fee Details
@reports_blueprint.route('/api/v1/reports/fee_details', methods=['GET'])
@token_required
def fee_details(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['FEE_DETAIL_REPORT'])
        fee_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        fee_details = pd.DataFrame.from_dict(fee_details)
        
        total_interest = []
        total_days_of_interest = []
        
        # Get the total interest
        for i in np.arange(0, len(fee_details)):
            if fee_details.iloc[i]['CATEGORY'] > 2:
                ti = get_total_interest(fee_details.iloc[i]['AMOUNT'], fee_details.iloc[i]['INTEREST'], fee_details.iloc[i]['EFFECTIVE_DATE'], fee_details.iloc[i]['EFFECTIVE_END_DATE'])
                td = get_total_days_of_interest(fee_details.iloc[i]['EFFECTIVE_DATE'], fee_details.iloc[i]['EFFECTIVE_END_DATE'])
            else :
                ti = 0
                td = 0
            total_interest.append(ti)
            total_days_of_interest.append(td)
        
        fee_details['TOTAL_DAYS_OF_INTEREST'] = total_days_of_interest
        fee_details['TOTAL_INTEREST_FEE'] = total_interest
        
        df_accrued_interest = fee_details.groupby('UNIQUE_ID')['TOTAL_INTEREST_FEE'].sum().reset_index()
        df_accrued_interest = df_accrued_interest.rename({'TOTAL_INTEREST_FEE': 'TOTAL_INTEREST'}, axis=1)

        fee_details = pd.merge(fee_details, df_accrued_interest, how='left')

        # Convert the date columns to datetime
        fee_details['EFFECTIVE_DATE'] = pd.to_datetime(fee_details['EFFECTIVE_DATE'])
        fee_details['EFFECTIVE_END_DATE'] = pd.to_datetime(fee_details['EFFECTIVE_END_DATE'])
        # fee_details.to_excel('all_fields.xlsx', index=False)

        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=fee_details.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500

@reports_blueprint.route('/api/v1/reports/sub_request_form', methods=['GET'])
@token_required
def sub_request_form(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['SUB_REQUEST_FORM'])
        sub_request_form = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        sub_request_form = pd.DataFrame.from_dict(sub_request_form)
        
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=sub_request_form.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500


# Lien Details Weekly Report
@reports_blueprint.route('/api/v1/reports/weekly_report', methods=['GET'])
@token_required
def weekly_report(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()

        mycursor.execute(reports_query['LIEN_DETAILS_WEEKLY_REPORT_HEADER'])
        header_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        header_details = pd.DataFrame.from_dict(header_details)

        mycursor.execute(reports_query['LIEN_DETAILS_WEEKLY_REPORT_ITEM_DETIALS'])
        all_parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        all_parcel_fees = pd.DataFrame.from_dict(all_parcel_fees)

        # Create a new dataframe to store the results
        results_df = pd.DataFrame()

        # Get the unique parcel ids
        unique_parcel_ids = all_parcel_fees['UNIQUE_ID'].unique()

        # Loop through the unique parcel ids
        for i in unique_parcel_ids:
            total_interest = []
            df = all_parcel_fees[all_parcel_fees['UNIQUE_ID'] == i]
            
            # Get the total penalty
            total_penalty = get_total_penalty(df.iloc[0]['BEGINNING_BALANCE'], df.iloc[0]['AMOUNT'], 'false')
            df['TOTAL_PENALTY'] = total_penalty

            # Get the total interest
            for i in np.arange(0, len(df)):
                if df.iloc[i]['CATEGORY'] > 2:
                    ti = get_total_interest(df.iloc[i]['AMOUNT'], df.iloc[i]['INTEREST'], df.iloc[i]['EFFECTIVE_DATE'], df.iloc[i]['EFFECTIVE_END_DATE'])
                else :
                    ti = 0
                    td = 0
                total_interest.append(ti)
            
            df['TOTAL_INTEREST'] = total_interest

            # Append to the results dataframe
            results_df = pd.concat([results_df, df], ignore_index=True)

        results_df[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']] = results_df[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']].apply(pd.to_numeric)
        results_df['TOTAL_AMOUNT'] = round(results_df['AMOUNT'] + results_df['TOTAL_INTEREST'] + results_df['FEES'] , 2)
        results_df = results_df[['UNIQUE_ID', 'TOTAL_INTEREST', 'TOTAL_PENALTY', 'TOTAL_AMOUNT']]

        results_df = results_df.groupby("UNIQUE_ID", as_index=False).agg(
            {"UNIQUE_ID": "min", "TOTAL_INTEREST": "sum", 'TOTAL_PENALTY': 'min', 'TOTAL_AMOUNT': 'sum'}
        )

        header_details = pd.merge(header_details, results_df, how='left')
        header_details['ORIGINAL_LIEN_EFFECTIVE_DATE'] = pd.to_datetime(header_details['ORIGINAL_LIEN_EFFECTIVE_DATE'])
        header_details['DATE_REDEEMED'] = pd.to_datetime(header_details['DATE_REDEEMED'])
        header_details['CHECK_RECEIVED'] = pd.to_datetime(header_details['CHECK_RECEIVED'])

        # header_details.to_excel('all_fields.xlsx', index=False)
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=header_details.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500


# New Pending Redemption Notice
@reports_blueprint.route('/api/v1/reports/new_pending_redemeption_notice', methods=['GET'])
@token_required
def new_pending_redemption(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['NEW_PENDING_REDEMPTION_NOTICE_TO_WSFS'])
        redem_report = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        redem_report = pd.DataFrame.from_dict(redem_report)
        
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=redem_report.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500
    

# WSFS Redemption Notification
@reports_blueprint.route('/api/v1/reports/wsfs_redemption_notification', methods=['GET'])
@token_required
def wsfs_redemption_notification(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['WSFS_REDEMPTION_NOTIFICATION'])
        redem_report = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        redem_report = pd.DataFrame.from_dict(redem_report)
        
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=redem_report.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500

# WSFS Redemption Notification
@reports_blueprint.route('/api/v1/reports/municipality_specific_query_for_subs', methods=['GET'])
@token_required
def municipality_specific_query_for_subs(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['MUNICIPALITY_SPECIFIC_QUERY_FOR_SUBS'])
        redem_report = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        redem_report = pd.DataFrame.from_dict(redem_report)
        
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=redem_report.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500
    
# WSFS New Lien Export Template
@reports_blueprint.route('/api/v1/reports/wsfs_new_lien_export_template', methods=['GET'])
@token_required
def wsfs_new_lien_export_template(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()
        mycursor.execute(reports_query['WSFS_NEW_LIEN_EXPORT_TEMPLATE'])
        redem_report = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        redem_report = pd.DataFrame.from_dict(redem_report)
        
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=redem_report.to_json(orient='records', date_format='iso'),
                        mimetype='application/json'
                    )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify("Something went wrong. Message: {m}".format(m = e)), 500



