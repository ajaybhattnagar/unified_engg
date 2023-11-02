from flask import Flask, request, jsonify, json, Blueprint, Response
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
from queries.details import details_query
from queries.labor import labor_query

labor_blueprint = Blueprint('labor_blueprint', __name__)

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
            data = str(data['CONNECTION_STRING'])
        except:
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(data, *args, **kwargs)
    return decorator

@labor_blueprint.route("/api/v1/labor/get_labor_tickets", methods=['POST'])
@token_required
def get_labor_tickets(connection_string):

    content = request.get_json(silent=True)
    try:

        if 'FROM_DATE' not in content:
            return jsonify({"message": "From Date is required"}), 401
        else:
            from_date = content['FROM_DATE'],
            from_date = ''.join(from_date)
        
        if 'TO_DATE' not in content:
            return jsonify({"message": "To DATE is required"}), 401
        else:
            to_date = content['TO_DATE'],
            to_date = ''.join(to_date)

        if 'EMPLOYEE_ID' not in content:
            employee_id = ''
            pass
        else:
            if content['EMPLOYEE_ID'] == 'ALL':
                employee_id = ''
            else:
                employee_id = content['EMPLOYEE_ID'],
                employee_id =  ''.join(employee_id)
                employee_id = "AND EMPLOYEE_ID = '{}'".format(employee_id)

        if 'APPROVED' not in content:
            approved = ''
            pass
        else:
            if content['APPROVED'] == 'ALL':
                approved = ''
            else:
                approved = content['APPROVED'],
                approved = ''.join(approved)
                approved = "AND APPROVED = '{}'".format(approved)

        query_string = details_query['GET_LABOR_TICKETS'].format(FROM_DATE=from_date, TO_DATE = to_date, EMP_ID_QUERY_STRING=employee_id, APPROVED_QUERY_STRING=approved)

        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(query_string)
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
    


@labor_blueprint.route("/api/v1/labor/create_labor_tickets", methods=['POST'])
@token_required
def create_labor_tickets(connection_string):
    content = request.get_json(silent=True)

    try:
        if 'RUN_TYPE' not in content:
            return jsonify({"message": "RUN_TYPE is required"}), 401

        # RUN_TYPE R
        if content['RUN_TYPE'] == 'R':
            run_type_string = 'RUN'
            query_string = labor_query['CREATE_START_LABOR_TICKET'].format(
                    WORKORDER_TYPE = 'W', 
                    WORKORDER_ID = content['WORKORDER_ID'], 
                    WORKORDER_LOT_ID = content['WORKORDER_LOT_ID'],
                    WORKORDER_SPLIT_ID = content['WORKORDER_SPLIT_ID'],
                    WORKORDER_SUB_ID = content['WORKORDER_SUB_ID'],
                    OPERATION_SEQ_NO = content['OPERATION_SEQ_NO'],
                    RUN_TYPE = content['RUN_TYPE'],
                    RUN_TYPE_STRING = run_type_string,  
                    EMP_ID = content['EMP_ID'],
                    RESOURCE_ID = content['RESOURCE_ID'],
                    DESCRIPTION = content['DESCRIPTION'] if 'DESCRIPTION' in content else '',
                    INDIRECT_CODE = content['INDIRECT_CODE'] if 'INDIRECT_CODE' in content else '',
                    INDIRECT_ID = content['INDIRECT_ID'] if 'INDIRECT_ID' in content else '',
                    UDF1 = content['UDF1'] if 'UDF1' in content else '',
                    UDF2 = content['UDF2'] if 'UDF2' in content else '',
                    UDF3 = content['UDF3'] if 'UDF3' in content else '',
                    UDF4 = content['UDF4'] if 'UDF4' in content else '',
                    WORK_LOCATION = content['WORK_LOCATION'] if 'WORK_LOCATION' in content else '',
                    REGULAR_TIME = 1 if 'regular' in content['WORK_TIME'].lower() else 0,
                    OVER_TIME = 1 if 'over' in content['WORK_TIME'].lower() else 0,
                    DOUBLE_TIME = 1 if 'double' in content['WORK_TIME'].lower() else 0,
                    )
            
        if content['RUN_TYPE'] == 'I':
            run_type_string = 'INDIRECT'
            query_string = labor_query['CREATE_START_LABOR_TICKET'].format(
                    WORKORDER_TYPE = '', 
                    WORKORDER_ID = '', 
                    WORKORDER_LOT_ID = '',
                    WORKORDER_SPLIT_ID = '',
                    WORKORDER_SUB_ID = '',
                    OPERATION_SEQ_NO = '',
                    RUN_TYPE = content['RUN_TYPE'],
                    RUN_TYPE_STRING = run_type_string,  
                    EMP_ID = content['EMP_ID'],
                    RESOURCE_ID = '',
                    DESCRIPTION = content['DESCRIPTION'] if 'DESCRIPTION' in content else '',
                    INDIRECT_CODE = content['INDIRECT_CODE'] if 'INDIRECT_CODE' in content else '',
                    INDIRECT_ID = content['INDIRECT_ID'] if 'INDIRECT_ID' in content else '',
                    UDF1 = content['UDF1'] if 'UDF1' in content else '',
                    UDF2 = content['UDF2'] if 'UDF2' in content else '',
                    UDF3 = content['UDF3'] if 'UDF3' in content else '',
                    UDF4 = content['UDF4'] if 'UDF4' in content else '',
                    )
            


        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute(query_string)
            cnxn.commit()
            sql.close()
            return jsonify({"message": "Ticket Created Successfully!"}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 401
            
    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
@labor_blueprint.route("/api/v1/labor/stop_labor_tickets", methods=['POST'])
@token_required
def stop_labor_tickets(connection_string):
    content = request.get_json(silent=True)
    try:
        query_string = labor_query['STOP_LABOR_TICKET'].format(
            TRANSACTION_ID = content['TRANSACTION_ID'],
        )
        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()

            sql.execute(query_string)
            cnxn.commit()
            sql.close()
            return jsonify({"message": "Ticket Stopped Successfully!"}), 200
        
        except Exception as e:
            return jsonify({"message": str(e)}), 401
            
    except Exception as e:
        return jsonify({"message": str(e)}), 401

@labor_blueprint.route("/api/v1/labor/work_order_operation_details", methods=['POST'])
@token_required
def get_work_order_operation_details(connection_string):
    content = request.get_json(silent=True)
    try:
        query_string = labor_query['GET_WORKORDER_OPERATION_DETAILS'].format(
            WORKORDER_TYPE = 'W',
            WORKORDER_ID = content['WORKORDER_ID'], 
            WORKORDER_LOT_ID = content['WORKORDER_LOT_ID'],
            WORKORDER_SPLIT_ID = content['WORKORDER_SPLIT_ID'],
            WORKORDER_SUB_ID = content['WORKORDER_SUB_ID'],
        )
        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute(query_string)
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
            
    except Exception as e:
        return jsonify({"message": str(e)}), 401

@labor_blueprint.route("/api/v1/labor/employee_scan_details", methods=['POST'])
@token_required
def employee_scan_details(connection_string):
    content = request.get_json(silent=True)
    try:
        query_string_last_30_tickets = labor_query['EMPLOYEE_LAST_30_LABOR_TICKETS'].format(
            EMP_ID = content['EMP_ID'],
        )
        query_string_check_active_labor = labor_query['EMPLOYEE_CHECK_FOR_ACTIVE_LABOR_TICKET'].format(
            EMP_ID = content['EMP_ID'],
        )
        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()

            sql.execute(query_string_last_30_tickets)
            results = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

            sql.execute(query_string_check_active_labor)
            active_labor_ticket = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            
            dict_results = {
                'last_30_tickets': results,
                'active_labor_ticket': active_labor_ticket
            }

            sql.close()

            response = Response(
                        response=simplejson.dumps(dict_results, ignore_nan=True,default=datetime.datetime.isoformat),
                        mimetype='application/json'
                    )
            response.headers['content-type'] = 'application/json'
            return response, 200
        except Exception as e:
            return jsonify({"message": str(e)}), 401
            
    except Exception as e:
        return jsonify({"message": str(e)}), 401

# Update labor tickets
@labor_blueprint.route("/api/v1/labor/update_labor_tickets", methods=['POST'])
@token_required
def update_labor_tickets(connection_string):
    content = request.get_json(silent=True)

    # Convert content to dataframe
    df = pd.DataFrame(content)
    df = df.replace(np.nan, '', regex=True)
    
    # ['TRANSACTION_ID', 'WORKORDER_BASE_ID', 'LOT_SPLIT_SUB', 'CLOCK_IN_DATE',
    #    'CLOCK_IN_TIME', 'CLOCK_OUT_DATE', 'CLOCK_OUT_TIME', 'HOURS_WORKED',
    #    'APPROVED', 'APPROVED_AT', 'APPROVED_BY', 'PART_ID', 'DESIRED_QTY',
    #    'DESIRED_WANT_DATE', 'STATUS', 'ENGINEERED_BY', 'ACT_MATERIAL_COST',
    #    'ACT_LABOR_COST', 'ACT_SERVICE_COST', 'ID', 'CUSTOMER_ID',
    #    'CUSTOMER_PO_REF', 'TOTAL_AMT_ORDERED', 'TOTAL_AMT_SHIPPED',
    #    'DESCRIPTION']

    # Combine date and time columns to create timestamp for sqlserver
    df['CLOCK_IN'] = df['CLOCK_IN_DATE'] + ' ' + df['CLOCK_IN_TIME']
    df['CLOCK_OUT'] = df['CLOCK_OUT_DATE'] + ' ' + df['CLOCK_OUT_TIME']
    df['CLOCK_IN'] = pd.to_datetime(df['CLOCK_IN'])
    df['CLOCK_OUT'] = pd.to_datetime(df['CLOCK_OUT'])

    query_string = labor_query['UPDATE_LABOR_TICEKT'].format(
        CLOCK_IN = df['CLOCK_IN'][0],
        CLOCK_OUT = df['CLOCK_OUT'][0],
        HOURS_BREAK = df['HOURS_BREAK'][0] if 'HOURS_BREAK' in df.columns else 0,
        DESCRIPTION = df['DESCRIPTION'][0],
        UDF1 = df['UDF1'][0],
        UDF2 = df['UDF2'][0],
        UDF3 = df['UDF3'][0],
        UDF4 = df['UDF4'][0],
        # Manage true as 1 and false as 0
        APPROVED = 1 if df['APPROVED'][0] == 'True' else 0,
        APPROVED_BY = df['APPROVED_BY'][0] if 'APPROVED_BY' in df.columns else '',
        APPROVED_AT = df['APPROVED_AT'][0] if 'APPROVED_AT' in df.columns else '',
        WORK_LOCATION = df['WORK_LOCATION'][0] if 'WORK_LOCATION' in df.columns else '',
        REGULAR_TIME = df['REGULAR_TIME'][0] if 'REGULAR_TIME' in df.columns else 0,
        OVER_TIME = df['OVER_TIME'][0] if 'OVER_TIME' in df.columns else 0,
        DOUBLE_TIME = df['DOUBLE_TIME'][0] if 'DOUBLE_TIME' in df.columns else 0,
        QA_NOTES = df['QA_NOTES'][0] if 'QA_NOTES' in df.columns else '',


        TRANSACTION_ID = df['TRANSACTION_ID'][0],
    )
    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(query_string)
        cnxn.commit()
        sql.close()
        return jsonify({"message": "Ticket Updated Successfully!"}), 200
        
    except Exception as e:
        return jsonify({"message": str(e)}), 401

    
      
