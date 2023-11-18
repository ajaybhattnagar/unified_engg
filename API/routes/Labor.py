from flask import Flask, request, jsonify, json, Blueprint, Response, session
from flask_cors import CORS, cross_origin
from functools import wraps
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
from werkzeug.utils import secure_filename
import jwt
import pyodbc 
from queries.details import details_query
from queries.labor import labor_query
from utils import send_email, save_base64_to_image, allowedFile
import os

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
            username = str(data['USERNAME'])
            data = str(data['CONNECTION_STRING'])
        except Exception as e:
            print (e)
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(data, username , *args, **kwargs)
    return decorator

@labor_blueprint.route("/api/v1/labor/get_labor_tickets", methods=['POST'])
@token_required
def get_labor_tickets(connection_string, username):

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

        query_string = details_query['GET_LABOR_TICKETS'].format(FROM_DATE=from_date, 
                                                                 TO_DATE = to_date, EMP_ID_QUERY_STRING=employee_id, 
                                                                 APPROVED_QUERY_STRING=approved)

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
def create_labor_tickets(connection_string, username):
    content = request.get_json(silent=True)

    try:
        if 'CLICKED_IMAGE' in content and content['CLICKED_IMAGE'] != ''and content['CLICKED_IMAGE'] != None and content['CLICKED_IMAGE'] != 'null':
            clicked_image = content['CLICKED_IMAGE']
            file_name = str(content['WORKORDER_ID'])  + '_' + datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            file_path = configData['save_images_to_folder'] + str(file_name) + '.png'
            save_base64_to_image(clicked_image, file_name)
        else:
            file_path = ''
    except Exception as e:
        file_path = ''
        pass
        print(e)

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
                    QA_NOTES = content['QA_NOTES'] if 'QA_NOTES' in content else '',
                    IMAGE_PATH = file_path,
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
                    WORK_LOCATION = content['WORK_LOCATION'] if 'WORK_LOCATION' in content else '',
                    REGULAR_TIME = 0,
                    OVER_TIME = 0,
                    DOUBLE_TIME = 0,
                    QA_NOTES = content['QA_NOTES'] if 'QA_NOTES' in content else '',
                    IMAGE_PATH = file_path,
                    )       

        try:
            cnxn = pyodbc.connect(connection_string, autocommit=True)
            cursor = cnxn.execute(query_string)

            cursor.nextset()
            for id in cursor:
                transaction_id = id[0]
            cursor.close()
            cnxn.close()

            try:
                if 'NOTIFY_QA' in content and content['NOTIFY_QA'] == 'Y':
                    email = configData['QA_email']
                    subject = 'Notification - Check for new Labor Ticket'
                    message = 'New Labor Ticket Created. Please review.'
                    send_email(email, subject, transaction_id)
            except Exception as e:
                print(e)
                pass

            return jsonify({"message": "Ticket Created Successfully!", "data": transaction_id}), 200

        except Exception as e:
            return jsonify({"message": str(e)}), 401
            
    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
@labor_blueprint.route("/api/v1/labor/stop_labor_tickets", methods=['POST'])
@token_required
def stop_labor_tickets(connection_string, username):
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
def get_work_order_operation_details(connection_string, username):
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
            print (e)
            return jsonify({"message": str(e)}), 401
            
    except Exception as e:
        return jsonify({"message": str(e)}), 401

@labor_blueprint.route("/api/v1/labor/employee_scan_details", methods=['POST'])
@token_required
def employee_scan_details(connection_string, username):
    content = request.get_json(silent=True)
    try:
        query_string_last_30_tickets = labor_query['EMPLOYEE_LAST_30_LABOR_TICKETS'].format(
            EMP_ID = content['EMP_ID'],
        )
        query_string_check_active_labor = labor_query['EMPLOYEE_CHECK_FOR_ACTIVE_LABOR_TICKET'].format(
            EMP_ID = content['EMP_ID'],
        )
        query_string_employee_kpi = labor_query['EMPLOYEE_KPIS'].format(
            EMP_ID = content['EMP_ID'],
        )
        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()

            sql.execute(query_string_last_30_tickets)
            results = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

            sql.execute(query_string_check_active_labor)
            active_labor_ticket = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

            sql.execute(query_string_employee_kpi)
            employee_kpis = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

            sql.execute(labor_query['GET_ALL_WORKORDER_LIST'])
            all_workorders_list = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            
            dict_results = {
                'last_30_tickets': results,
                'active_labor_ticket': active_labor_ticket,
                'employee_kpis': employee_kpis,
                'all_workorders_list': all_workorders_list
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
def update_labor_tickets(connection_string, username):
    content = request.get_json(silent=True)
    # Convert content to dataframe
    df = pd.DataFrame(content)
    df = df.replace(np.nan, '', regex=True)
    
    df['CLOCK_IN'] = df['CLOCK_IN_DATE'] + ' ' + df['CLOCK_IN_TIME']
    df['CLOCK_OUT'] = df['CLOCK_OUT_DATE'] + ' ' + df['CLOCK_OUT_TIME']
    df['CLOCK_IN'] = pd.to_datetime(df['CLOCK_IN'])
    df['CLOCK_OUT'] = pd.to_datetime(df['CLOCK_OUT'])

    for index, row in df.iterrows():
        if df['CLOCK_IN'][index] > df['CLOCK_OUT'][index]:
            return jsonify({"message": "Clock In Date cannot be greater than Clock Out Date. Note: Some transactions might have been affected."}), 401
        
        if df['APPROVED'][index] == True:
            approved_by = username
            approved_at = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        else:
            approved_by = ''
            approved_at = ''

        query_string = labor_query['UPDATE_LABOR_TICEKT'].format(
            CLOCK_IN = df['CLOCK_IN'][index],
            CLOCK_OUT = df['CLOCK_OUT'][index],
            HOURS_BREAK = df['HOURS_BREAK'][index] if 'HOURS_BREAK' in df.columns else 0,
            DESCRIPTION = df['DESCRIPTION'][index],
            UDF1 = df['UDF1'][index],
            UDF2 = df['UDF2'][index],
            UDF3 = df['UDF3'][index],
            UDF4 = df['UDF4'][index],
            # Manage true as 1 and false as 0
            APPROVED = 1 if df['APPROVED'][index] == True else 0,
            APPROVED_BY = approved_by,
            APPROVED_AT = approved_at,
            WORK_LOCATION = df['WORK_LOCATION'][index] if 'WORK_LOCATION' in df.columns else '',

            REGULAR_TIME = 1 if df['REGULAR_TIME'][index] == True else 0,
            OVER_TIME = 1 if df['OVER_TIME'][index] == True else 0,
            DOUBLE_TIME = 1 if df['DOUBLE_TIME'][index] == True else 0,
            QA_NOTES = df['QA_NOTES'][index] if 'QA_NOTES' in df.columns else '',


            TRANSACTION_ID = df['TRANSACTION_ID'][index],
        )

        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute(query_string)
            cnxn.commit()
            sql.close()
           
        except Exception as e:
            return jsonify({"message": str(e)}), 401
    
    return jsonify({"message": "Ticket Updated Successfully!"}), 200


@labor_blueprint.route("/api/v1/email/test_smtp", methods=['POST'])
@token_required
def test_smtp(connection_string, username):
    content = request.get_json(silent=True)
    try:
        if 'EMAIL' not in content:
            return jsonify({"message": "EMAIL is required"}), 401
        else:
            email = content['EMAIL'],
            email = ''.join(email)

        if 'SUBJECT' not in content:
            return jsonify({"message": "SUBJECT is required"}), 401
        else:
            subject = content['SUBJECT'],
            subject = ''.join(subject)

        if 'MESSAGE' not in content:
            return jsonify({"message": "MESSAGE is required"}), 401
        else:
            message = content['MESSAGE'],
            message = ''.join(message)

        try:
            send_email(email, subject, message)
            return jsonify({"message": "Email Sent Successfully!"}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 401

    except Exception as e:
        return jsonify({"message": str(e)}), 401


@labor_blueprint.route("/api/v1/labor/upload_document/<trans_id>", methods=['POST'])
@token_required
def upload_document(connection_string, username, trans_id):
    file = request.files.getlist('file')
    transaction_id = trans_id
    try:
        for f in file:
            filename = secure_filename(f.filename)
            if allowedFile(filename):
                file_path = os.path.join(configData['save_documents_to_folder'], filename)
                f.save(os.path.join(configData['save_documents_to_folder'], filename))

                # Update database with file path
                query_string = labor_query['UPDATE_LABOR_TICKET_DOCUMENT'].format(
                    DOCUMENT_PATH = file_path,
                    TRANSACTION_ID = transaction_id,
                )
                try:
                    cnxn = pyodbc.connect(connection_string)
                    sql = cnxn.cursor()
                    sql.execute(query_string)
                    cnxn.commit()
                    sql.close()
                    return jsonify({'message': 'File uploaded successfully'}), 200

                except Exception as e:
                    return jsonify({"message": str(e)}), 401

            else:
                return jsonify({'message': 'File type not allowed'}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 401
