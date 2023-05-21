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
from helpers.function import get_total_penalty, get_total_interest, get_total_days_of_interest, get_interst_acc_for_florida

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

# Needs florida settings
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
        
        # Get the total interest
        for i in np.arange(0, len(fee_details)):
            if fee_details.iloc[i]['CATEGORY'] > 2:
                ti = get_total_interest(fee_details.iloc[i]['AMOUNT'], fee_details.iloc[i]['INTEREST'], fee_details.iloc[i]['EFFECTIVE_DATE'], fee_details.iloc[i]['EFFECTIVE_END_DATE'])
            else :
                ti = 0
            
            if ('florida' in fee_details.iloc[i]['STATE'].lower()) and (fee_details.iloc[i]['CATEGORY'] == 1):
                ti = get_interst_acc_for_florida(fee_details.iloc[i]['BEGINNING BALANCE'], fee_details.iloc[i]['FEES'])

            total_interest.append(ti)
        
        fee_details['TOTAL_INTEREST_FEE'] = total_interest
        
        df_accrued_interest = fee_details.groupby('UNIQUE_ID')['TOTAL_INTEREST_FEE'].sum().reset_index()
        df_accrued_interest = df_accrued_interest.rename({'TOTAL_INTEREST_FEE': 'TOTAL_INTEREST'}, axis=1)

        fee_details = pd.merge(fee_details, df_accrued_interest, how='left')

        # Convert the date columns to datetime
        fee_details['EFFECTIVE_DATE'] = pd.to_datetime(fee_details['EFFECTIVE_DATE']).dt.strftime('%m/%d/%Y')
        fee_details['EFFECTIVE_END_DATE_DISPLAY'] = pd.to_datetime(fee_details['EFFECTIVE_END_DATE_DISPLAY']).dt.strftime('%m/%d/%Y')
        fee_details['LAST MODIFY DATE'] = pd.to_datetime(fee_details['LAST MODIFY DATE']).dt.strftime('%m/%d/%Y')

        # fee_details.to_excel('all_fields.xlsx', index=False)
        # Drop columns
        fee_details = fee_details.drop(["EFFECTIVE_END_DATE"], axis=1)

        fee_details = fee_details.rename(columns = {
           "UNIQUE_ID": "REFERENCE ID",
           "PARCEL_ID": "PARCEL",
           "CATEGORY_STRING": "FEES: CATEGORY",
           "FEES": "FEES: AMOUNT",
           "EFFECTIVE_DATE": "FEES: EFFECTIVE DATE",
        #    "EFFECTIVE_END_DATE": "FEES: END DATE",
           "INTEREST": "FEES: INTEREST",
           "INTEREST_ACC_INTERVAL": "FEES: INTERVAL",
           "DESCRIPTION": "FEES: DESCRIPTION",
           "TOTAL_INTEREST": "INTEREST ACCRUED VALUE",
           "EFFECTIVE_END_DATE_DISPLAY": "FEES: END DATE"
        })
        fee_details = fee_details[['STATUS', 'STATE', 'COUNTY', 'MUNICIPALITY', 'REFERENCE ID', 'PARCEL', 'CERTIFICATE', 'CUSTODIAN REFERENCE NUMBER', 'FEES: CATEGORY',
                    'FEES: AMOUNT', 'FEES: EFFECTIVE DATE', 'FEES: END DATE', 'FEES: INTEREST', 'FEES: INTERVAL', 'FEES: NON-REDEEMABLE', 'FEES: DESCRIPTION', 'INTEREST ACCRUED VALUE', 'LAST MODIFY DATE']]

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

        # Get the unique parcel ids
        unique_parcel_ids = all_parcel_fees['UNIQUE_ID'].unique()

        # Save column names
        column_names = all_parcel_fees.columns.to_list()
        column_names.append('TOTAL_INTEREST')
        column_names.append('TOTAL_PENALTY')

        # dataframe to list of list
        all_parcel_fees = all_parcel_fees.values.tolist()

        final_results = []

        # Loop through the unique parcel ids
        for i in unique_parcel_ids:
            # filter all_parcel_fees by the unique parcel id
            df = [x for x in all_parcel_fees if x[0] == i]

            # Get the total penalty
            if 'florida' in df[0][12].lower():
                total_penalty = 0
            else:
                total_penalty = get_total_penalty(df[0][9], df[0][3], 'false')

            # Get the total interest
            for i in np.arange(0, len(df)):

                if ('florida' not in df[0][12].lower()) and (df[i][2] > 2):
                    ti = get_total_interest(df[i][3], df[i][5], df[i][7], df[i][8])
                else :
                    ti = 0

                if ('florida' in df[0][12].lower()) and (df[i][2] == 1):
                    ti = get_interst_acc_for_florida(df[i][4], df[i][5])
                
                df[i].insert(13, ti)
                df[i].insert(14, total_penalty)
                final_results.append(df[i])

        # Convert the list of list to dataframe
        final_results = pd.DataFrame(final_results, columns=column_names)
        final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']] = final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']].apply(pd.to_numeric)
        final_results['TOTAL_AMOUNT'] = round(final_results['AMOUNT'] + final_results['TOTAL_INTEREST'] + final_results['FEES'] + final_results['TOTAL_PENALTY'], 2)
        final_results = final_results[['UNIQUE_ID', 'TOTAL_INTEREST', 'TOTAL_PENALTY', 'TOTAL_AMOUNT']]

        final_results = final_results.groupby("UNIQUE_ID", as_index=False).agg(
            {"UNIQUE_ID": "min", "TOTAL_INTEREST": "sum", 'TOTAL_PENALTY': 'min', 'TOTAL_AMOUNT': 'sum'}
        )

        header_details = pd.merge(header_details, final_results, how='left')

        header_details = header_details.rename(columns = {
           "UNIQUE_ID": "REFERENCE ID",
           "COUNTY_LAND_USE_DESC": "PROPERTY TYPE",
           "PARCEL_ID": "PARCEL",
           "TOTAL_MARKET_VALUE": "TOTAL MARKET VALUE",
           "TOTAL_ASSESSED_VALUE": "TOTAL ASSESSED VALUE",
           "ORIGINAL_LIEN_AMOUNT": "BEGINNING BALANCE",
           "ORIGINAL_LIEN_EFFECTIVE_DATE": "BEGINNING BALANCE EFFECTIVE DATE",
           "PREMIUM_AMOUNT": "PREMIUMS",
           "TOTAL_INTEREST": "INTEREST ACCRUED VALUE",
           "TOTAL_PENALTY": "PENALTY",
           "TOTAL_AMOUNT": "TOTAL PAYOFF"
        })
        header_details = header_details[['REFERENCE ID', 'STATUS', 'BEGINNING BALANCE EFFECTIVE DATE', 'STATE', 'MUNICIPALITY', 'COUNTY', 'PROPERTY TYPE',
        'PARCEL', 'CERTIFICATE', 'TOTAL MARKET VALUE', 'TOTAL ASSESSED VALUE', 'BEGINNING BALANCE', 'REFUNDS', 'SUB 1 AMOUNT', 'SUB 2 AMOUNT', 'LIEN/MARKET VALUE',
        'OTHER FEES', 'INTEREST ACCRUED VALUE', 'PENALTY', 'PREMIUMS', 'TOTAL PAYOFF', 'REDEMPTION DATE', 'REFUNDED', 'REDEMPTION CHECK RECEIVED', 'REDEMPTION CHECK AMOUNT'
        ]]

        data_type_cols = ['BEGINNING BALANCE EFFECTIVE DATE', 'REDEMPTION DATE', 'REDEMPTION CHECK RECEIVED']
        for i in data_type_cols:
            header_details[i] = pd.to_datetime(header_details[i], errors='coerce')
            header_details[i] = header_details[i].dt.strftime('%m/%d/%Y')
        
        # Updating total accrued interest to zero if status is REFUNDED
        header_details.loc[header_details['STATUS'] == 'REFUNDED', 'INTEREST ACCRUED VALUE'] = 0

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
        
        final_results = pd.DataFrame()
        total_interest = []
    
        unique_parcel_ids = redem_report['REFERENCE ID'].unique()
        ti = []
        # Loop through the unique parcel ids
        for i in unique_parcel_ids:
            total_interest = []
            total_days_of_interest = []
            df = redem_report[redem_report['REFERENCE ID'] == i]
            
            # Get the total penalty
            if ('florida' in df.iloc[0]['COUNTY, STATE'].lower()):
                total_penalty = 0
            else :
                total_penalty = round(get_total_penalty(df.iloc[0]['BEGINNING BALANCE'], df.iloc[0]['AMOUNT'], 'false'),2)
            df['TOTAL_PENALTY'] = total_penalty

            # Get the total interest
            for i in np.arange(0, len(df)):
                if df.iloc[i]['CATEGORY'] > 2:
                    ti = get_total_interest(df.iloc[i]['AMOUNT'], df.iloc[i]['INTEREST'], df.iloc[i]['EFFECTIVE_DATE'], df.iloc[i]['EFFECTIVE_END_DATE'])
                else :
                    ti = 0.00
                
                if ('florida' in df.iloc[0]['COUNTY, STATE'].lower()) and (df.iloc[i]['CATEGORY'] == 1):
                    ti = get_interst_acc_for_florida(df.iloc[i]['BEGINNING BALANCE'], df.iloc[i]['INTEREST'])
                total_interest.append(ti)
            
            df['TOTAL_INTEREST'] = total_interest

            df = df.groupby("REFERENCE ID", as_index=False).agg(
                {"COUNTY, STATE": 'min', "MUNICIPALITY": 'min', "REFERENCE ID": "min", "BEGINNING BALANCE EFFECTIVE DATE": 'min', "ADDRESS": 'min',
                "LOCATION CITY": "min", 'ZIP CODE': 'min', 'LEGAL BLOCK': 'min', 'LEGAL LOT NUMBER': 'min', 'QUALIFIER': 'min', 'BEGINNING BALANCE': 'min',
                "TOTAL REDEEMABLE": 'min', 'STATUS': 'min', 'CERTIFICATE': 'min', 'PAYMENT': 'min',
                "TOTAL_INTEREST": "sum", 'TOTAL_PENALTY': 'min', 'AMOUNT': 'sum', 'FEES': 'sum'}
            )

            final_results = pd.concat([final_results, df], ignore_index=True)


        final_results[["TOTAL_INTEREST", "TOTAL_PENALTY", 'AMOUNT', 'FEES', 'PAYMENT']] = final_results[["TOTAL_INTEREST", "TOTAL_PENALTY", 'AMOUNT', 'FEES', 'PAYMENT']].apply(pd.to_numeric)
        final_results['TOTAL REDEEMABLE'] = final_results['TOTAL_INTEREST'] + final_results['TOTAL_PENALTY'] + final_results['AMOUNT'] + final_results['FEES'] - final_results['PAYMENT']
        final_results = final_results.drop(['TOTAL_INTEREST', 'TOTAL_PENALTY', 'AMOUNT', 'FEES'], axis=1)

        # Change date format
        final_results['BEGINNING BALANCE EFFECTIVE DATE'] = final_results['BEGINNING BALANCE EFFECTIVE DATE'].dt.strftime('%m/%d/%Y')
        
        # Close the connection
        mycursor.close()
        connection.close()
        # Setting the response to json
        response = Response(
                        response=final_results.to_json(orient='records', date_format='iso'),
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
        
        redem_report['BEGINNING BALANCE EFFECTIVE DATE'] = redem_report['BEGINNING BALANCE EFFECTIVE DATE'].dt.strftime('%m/%d/%Y')
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

# REDEMPTION REPORT
@reports_blueprint.route('/api/v1/reports/redemption_report', methods=['GET'])
@token_required
def redemption_report(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()

        mycursor.execute(reports_query['REDEMPTION_REPORT'])
        header_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        header_details = pd.DataFrame.from_dict(header_details)
        # Removing the duplicates

        mycursor.execute(reports_query['LIEN_DETAILS_WEEKLY_REPORT_ITEM_DETIALS'])
        all_parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        all_parcel_fees = pd.DataFrame.from_dict(all_parcel_fees)

    except Exception as e:
        return jsonify("Failed while querying data. Message: {m}".format(m = e)), 500
    
    # Get the unique parcel ids
    unique_parcel_ids = all_parcel_fees['UNIQUE_ID'].unique()

    # Save column names
    column_names = all_parcel_fees.columns.to_list()
    column_names.append('TOTAL_INTEREST')
    column_names.append('TOTAL_PENALTY')

    # dataframe to list of list
    all_parcel_fees = all_parcel_fees.values.tolist()

    final_results = []

    # Loop through the unique parcel ids
    for i in unique_parcel_ids:
        # filter all_parcel_fees by the unique parcel id
        df = [x for x in all_parcel_fees if x[0] == i]

        # Get the total penalty
        if 'florida' in df[0][12].lower():
            total_penalty = 0
        else:
            total_penalty = get_total_penalty(df[0][9], df[0][3], 'false')

        # Get the total interest
        for i in np.arange(0, len(df)):

            if ('florida' not in df[0][12].lower()) and (df[i][2] > 2):
                ti = get_total_interest(df[i][3], df[i][5], df[i][7], df[i][8])
            else :
                ti = 0

            if ('florida' in df[0][12].lower()) and (df[i][2] == 1):
                ti = get_interst_acc_for_florida(df[i][4], df[i][5])
            
            df[i].insert(13, ti)
            df[i].insert(14, total_penalty)
            final_results.append(df[i])
    
    # Convert the list of list to dataframe
    final_results = pd.DataFrame(final_results, columns=column_names)
    final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']] = final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']].apply(pd.to_numeric)
    final_results['TOTAL_AMOUNT'] = round(final_results['AMOUNT'] + final_results['TOTAL_INTEREST'] + final_results['FEES'] + final_results['TOTAL_PENALTY'], 2)
    final_results = final_results[['UNIQUE_ID', 'TOTAL_INTEREST', 'TOTAL_PENALTY', 'TOTAL_AMOUNT']]

    final_results = final_results.groupby("UNIQUE_ID", as_index=False).agg(
        {"UNIQUE_ID": "min", "TOTAL_INTEREST": "sum", 'TOTAL_PENALTY': 'min', 'TOTAL_AMOUNT': 'sum'}
    )

    header_details = pd.merge(header_details, final_results, how='left')

    header_details = header_details.rename(columns = {
           "UNIQUE_ID": "REFERENCE ID",
           "COUNTY_LAND_USE_DESC": "PROPERTY TYPE",
           "PARCEL_ID": "PARCEL",
           "TOTAL_MARKET_VALUE": "TOTAL MARKET VALUE",
           "TOTAL_ASSESSED_VALUE": "TOTAL ASSESSED VALUE",
           "ORIGINAL_LIEN_AMOUNT": "BEGINNING BALANCE",
           "ORIGINAL_LIEN_EFFECTIVE_DATE": "BEGINNING BALANCE EFFECTIVE DATE",
           "PREMIUM_AMOUNT": "PREMIUMS",
           "TOTAL_INTEREST": "INTEREST ACCRUED VALUE",
           "TOTAL_PENALTY": "PENALTY",
           "TOTAL_AMOUNT": "TOTAL PAYOFF"
        })
   
    header_details['BEGINNING BALANCE EFFECTIVE DATE'] = header_details['BEGINNING BALANCE EFFECTIVE DATE'].dt.strftime('%m/%d/%Y')
    header_details['REDEMPTION DATE'] = header_details['REDEMPTION DATE'].dt.strftime('%m/%d/%Y')
    header_details['REDEMPTION CHECK EFFECTIVE DATE'] = header_details['REDEMPTION CHECK EFFECTIVE DATE'].dt.strftime('%m/%d/%Y')
    header_details['REDEMPTION CHECK RECEIVED'] = header_details['REDEMPTION CHECK RECEIVED'].dt.strftime('%m/%d/%Y')
    header_details['SUB 1 EFFECTIVE DATE'] = header_details['SUB 1 EFFECTIVE DATE'].dt.strftime('%m/%d/%Y')

    mycursor.close()
    connection.close()
    
    # Setting the response to json
    response = Response(
                    response=header_details.to_json(orient='records', date_format='iso'),
                    mimetype='application/json'
                )
    response.headers['content-type'] = 'application/json'
    return response, 200
    
# WSFS V LTVL Status
@reports_blueprint.route('/api/v1/reports/wsfs_ltvl_status', methods=['GET'])
@token_required
def wsfs_ltvl_status(current_user):
    connection = connect_database(current_user)
    try:
        mycursor = connection.cursor()

        mycursor.execute(reports_query['WSFS_LTVL_STATUS'])
        header_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        header_details = pd.DataFrame.from_dict(header_details)
        # Removing the duplicates

        mycursor.execute(reports_query['LIEN_DETAILS_WEEKLY_REPORT_ITEM_DETIALS'])
        all_parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        all_parcel_fees = pd.DataFrame.from_dict(all_parcel_fees)

    except Exception as e:
        return jsonify("Failed while querying data. Message: {m}".format(m = e)), 500

    # Get the unique parcel ids
    unique_parcel_ids = all_parcel_fees['UNIQUE_ID'].unique()

    # Save column names
    column_names = all_parcel_fees.columns.to_list()
    column_names.append('TOTAL_INTEREST')
    column_names.append('TOTAL_PENALTY')

    # dataframe to list of list
    all_parcel_fees = all_parcel_fees.values.tolist()

    final_results = []

    # Loop through the unique parcel ids
    for i in unique_parcel_ids:
        # filter all_parcel_fees by the unique parcel id
        df = [x for x in all_parcel_fees if x[0] == i]

        # Get the total penalty
        if 'florida' in df[0][12].lower():
            total_penalty = 0
        else:
            total_penalty = get_total_penalty(df[0][9], df[0][3], 'false')

        # Get the total interest
        for i in np.arange(0, len(df)):

            if ('florida' not in df[0][12].lower()) and (df[i][2] > 2):
                ti = get_total_interest(df[i][3], df[i][5], df[i][7], df[i][8])
            else :
                ti = 0

            if ('florida' in df[0][12].lower()) and (df[i][2] == 1):
                ti = get_interst_acc_for_florida(df[i][4], df[i][5])
            
            df[i].insert(13, ti)
            df[i].insert(14, total_penalty)
            final_results.append(df[i])
    
    # Convert the list of list to dataframe
    final_results = pd.DataFrame(final_results, columns=column_names)
    final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']] = final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']].apply(pd.to_numeric)
    final_results['TOTAL_REDEEMABLE'] = round(final_results['AMOUNT'] + final_results['TOTAL_INTEREST'] + final_results['FEES'] + final_results['TOTAL_PENALTY'], 2)
    final_results = final_results.groupby("UNIQUE_ID", as_index=False).agg(
            {"UNIQUE_ID": "min", "TOTAL_INTEREST": "sum", 'TOTAL_PENALTY': 'min', 'FEES': 'sum', 'AMOUNT': 'sum'}
        )
    final_results['TOTAL_REDEEMABLE'] = round(final_results['AMOUNT'] + final_results['TOTAL_INTEREST'] + final_results['FEES'] + final_results['TOTAL_PENALTY'], 2)

    # Rename the columns
    final_results = final_results.rename(columns = {"UNIQUE_ID": "REFERENCE ID"})
    final_results = final_results[['REFERENCE ID', 'TOTAL_REDEEMABLE']]

    header_details = pd.merge(header_details, final_results, how='left')
    
    header_details.drop(['STATUS'], axis=1, inplace=True)
    header_details = header_details.rename(columns = {"STATUS_S" : "STATUS"})
    header_details.loc[header_details['STATUS'] == 'REFUNDED', 'INTEREST ACCRUED VALUE'] = 0

    data_type_cols = ['BEGINNING BALANCE EFFECTIVE DATE', 'REDEMPTION DATE', 'REDEMPTION CHECK RECEIVED', 'ACTIVE', 'PARTIAL_RED_DT', 'PEND_RED_DT', 'REFUND_DT', 'BANKRUP_DT', 'REDEEMED']
    for i in data_type_cols:
        header_details[i] = pd.to_datetime(header_details[i], errors='coerce')
        header_details[i] = header_details[i].dt.strftime('%m/%d/%Y')

    mycursor.close()
    connection.close()
    # Setting the response to json
    response = Response(
                    response=header_details.to_json(orient='records', date_format='iso'),
                    mimetype='application/json'
                )
    response.headers['content-type'] = 'application/json'
    return response, 200