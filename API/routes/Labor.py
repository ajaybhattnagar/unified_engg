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

        if 'DATE' not in content:
            return jsonify({"message": "DATE is required"}), 401
        else:
            date = content['DATE'],
            date = ''.join(date)

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

        query_string = details_query['GET_LABOR_TICKETS'].format(DATE=date, EMP_ID_QUERY_STRING=employee_id, APPROVED_QUERY_STRING=approved)

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
