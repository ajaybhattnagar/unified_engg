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
from queries.details import details_query
from queries.labor import labor_query
import os
from utils import list_files, send_email, allowedFile, save_base64_to_image
from werkzeug.utils import secure_filename


details_blueprint = Blueprint('details_blueprint', __name__)

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

@details_blueprint.route("/api/v1/details/indirectcodes", methods=['GET'])
@token_required
def indirect_codes(connection_string, username):
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_INDIRECT_CODES'])
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
    
@details_blueprint.route("/api/v1/details/site_warehouse", methods=['GET'])
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

@details_blueprint.route("/api/v1/details/dashboard", methods=['GET'])
@token_required
def dashboard(connection_string, username):
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_ACTIVE_LABOR_TICKETS'])
        active_labor = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(details_query['GET_ALL_EMPLOYEE_HOURS_KPI'])
        employee_kpi = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(details_query['GET_CLOCK_IN_VS_LABOR_KPI'])
        clock_in_vs_labor = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]


        sql.close()

        response_dict = {
            "ACTIVE_LABOR_TICKETS": active_labor,
            "EMPLOYEE_KPI": employee_kpi,
            "CLOCK_IN_VS_LABOR_KPI": clock_in_vs_labor
        }
        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401

@details_blueprint.route("/api/v1/details/dashboard_documents_notifications", methods=['GET'])
@token_required
def documents_notifications(connection_string, username):
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_UPLOAD_DOCUMENTS_IMAGES'].format(FROM_DATE = from_date, TO_DATE = to_date))
        documents = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(details_query['GET_SENT_NOTIFICATIONS'].format(FROM_DATE = from_date, TO_DATE = to_date))
        notifications = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.close()

        response_dict = {
            "DOCUMENTS": documents,
            "NOTIFICATIONS": notifications,
        }
        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401



@details_blueprint.route("/api/v1/details/labor_ticket/<trans_id>", methods=['GET'])
@token_required
def labor_tickets(connection_string, username, trans_id):
    transaction_id = trans_id
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_LABOR_TICKET_BY_ID'].format(TRANSACTION_ID=transaction_id))
        labor_tickets = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.execute(details_query['GET_ALL_DOCUMENTS_IMAGES_BY_ID'].format(TRANSACTION_ID=transaction_id))
        documents = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.close()

        response_dict = {
            "TICKET_DETAILS": labor_tickets,
            "DOCUMENTS": documents
        }

        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401

@details_blueprint.route("/api/v1/details/purchase_order/<trans_id>", methods=['GET'])
@token_required
def purchase_order_noti_details(connection_string, username, trans_id):
    transaction_id = trans_id
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute(details_query['GET_ALL_DOCUMENTS_IMAGES_BY_ID'].format(TRANSACTION_ID=transaction_id))
        documents = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

        sql.close()

        response_dict = {
            "TICKET_DETAILS": [],
            "DOCUMENTS": documents
        }

        response = Response(
                    response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401
    

# Return a file 
@details_blueprint.route("/api/v1/details/get_files", methods=['POST'])
@token_required
def files(connection_string, username):
    content = request.get_json(silent=True)
    FILE_PATH = content['FILE_PATH']
    # Add notes to a parcel   
    try:
        return send_file(FILE_PATH, as_attachment=True)
    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
# Get work order details for tree diagram
@details_blueprint.route("/api/v1/details/work_order", methods=['GET'])
@token_required
def work_order_details_tree_diagram(connection_string, username):
    cnxn = pyodbc.connect(connection_string)
    base_id = request.args.get('base_id')
    # Add notes to a parcel   
    try:

        if base_id == '' or base_id == None or base_id == 'undefined' or base_id == 'null' or base_id == 'None':
            sql = cnxn.cursor()
            sql.execute(details_query['GET_ALL_ACTIVE_WORKORDERS'])
            header_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            sql.close()
            response = Response(
                        response=simplejson.dumps(header_details, ignore_nan=True,default=datetime.datetime.isoformat),
                        mimetype='application/json'
                    )
            response.headers['content-type'] = 'application/json'
            return response, 200

        if (base_id):
            sql = cnxn.cursor()
            sql.execute(details_query['GET_WORKORDER_HEADER_DETAILS'].format(BASE_ID = base_id))
            header_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

            # Loop over the header details and get the children
            for header in header_details:
                sql.execute(details_query['GET_OPERATION_DETAILS_PER_SUB_ID'].format(BASE_ID = base_id, SUB_ID = header['SUB_ID']))
                operation_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
                header['children'] = operation_details

            sql.close()

            response_dict = {
            'id': "root",
                'name': "root",
                'children': header_details
            }

            response = Response(
                        response=simplejson.dumps(response_dict, ignore_nan=True,default=datetime.datetime.isoformat),
                        mimetype='application/json'
                    )
            response.headers['content-type'] = 'application/json'
            return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401


@details_blueprint.route("/api/v1/details/u_drive_files/<base_id>", methods=['GET'])
@token_required
def get_all_u_drive_files(connection_string, username, base_id):
    base_id = 'Q' + str(base_id)
    try:
        array_for_files = []
        folder_path = configData['u_drive_path']
        folder_name = base_id
        file_path = os.path.join(folder_path ,folder_name, 'Upload')

        # Create upload folder if not exist
        if not os.path.exists(file_path):
            os.makedirs(file_path)
        
        if (os.path.exists(file_path) and os.path.isdir(file_path)):
            for file_path in list_files(file_path):
                file_name = file_path.split("\\")[-1]
                arr = {
                    "FILE_NAME": file_name,
                    "FILE_PATH": file_path
                }
                array_for_files.append(arr)
            return array_for_files, 200
        else:
           return jsonify({"message":"Folder does not exist!"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
@details_blueprint.route("/api/v1/details/employees", methods=['GET'])
@token_required
def get_all_employees(connection_string, username):
    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(details_query['GET_ALL_EMPLOYEES'])
        employees = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        sql.close()

        response = Response(
                    response=simplejson.dumps(employees, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify({"message": str(e)}), 401
    
@details_blueprint.route("/api/v1/details/operation", methods=['GET', 'POST'])
@token_required
def operation_details(connection_string, username):
    if request.method == 'GET':
        base_id = request.args.get('base_id')
        sub_id = request.args.get('sub_id')
        operation_seq = request.args.get('operation_seq')

        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute(details_query['GET_QUALITY_UPDATES'].format(BASE_ID = base_id, SUB_ID = sub_id))
            operation_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

            # Filter operation_details dict selected operation_seq
            operation_details = [x for x in operation_details if x['SEQUENCE_NO'] == int(operation_seq)]
            sql.close()           

            response = Response(
                        response=simplejson.dumps(operation_details, ignore_nan=True,default=datetime.datetime.isoformat),
                        mimetype='application/json'
                    )
            response.headers['content-type'] = 'application/json'
            return response, 200

        except Exception as e:
            print (e)
            return jsonify({"message": str(e)}), 401
    
    if request.method == 'POST':
        content = request.get_json(silent=True)
        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute(details_query['ADD_QUALITY_RECORD'].format(
                BASE_ID = content['BASE_ID'], 
                SUB_ID = content['SUB_ID'], 
                OPERATION_SEQ_NO = content['SEQUENCE_NO'], 
                NOTIFY_EMPLOYEE = content['NOTIFY_EMPLOYEE'] if 'NOTIFY_EMPLOYEE' in content else '',
                FAB_SIGN_OFF = content['FAB_SIGN_OFF'] if 'FAB_SIGN_OFF' in content else '',
                QA_SIGN_OFF = content['QA_SIGN_OFF'] if 'QA_SIGN_OFF' in content else '',
                QA_ACCEPT = content['QA_ACCEPT'] if 'QA_ACCEPT' in content else '',
                QA_REJECT = content['QA_REJECT'] if 'QA_REJECT' in content else '',
                NOTES = content['NOTES'] if 'NOTES' in content else '',
                EMPLOYEE_ID = username
                )
            )
            cnxn.commit()
            sql.close()

            return jsonify({"message": "Quality update added successfully!"}), 200

        except Exception as e:
            print (e)
            return jsonify({"message": str(e)}), 401

@details_blueprint.route("/api/v1/details/upload_document/<unique_id>", methods=['POST'])
@token_required
def upload_document(connection_string, username, unique_id):
    file = request.files.getlist('file')
    try:
        for f in file:
            filename = secure_filename(f.filename)
            if allowedFile(filename):
                
                file_path = configData['u_drive_path'] +  "\\Documents" + '\\'

                # Create upload folder if not exist
                if not os.path.exists(file_path):
                    os.makedirs(file_path)

                file_path = os.path.join(file_path, filename)
                f.save(file_path)

                # Update database with file path
                query_string = labor_query['INSERT_INTO_DOCUMENTS'].format(
                    TYPE = 'DOCUMENT',
                    FILE_PATH = file_path,
                    TRANSACTION_ID = unique_id,
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


@details_blueprint.route("/api/v1/details/upload_image/<unique_id>", methods=['POST'])
@token_required
def upload_image(connection_string, username, unique_id):
    content = request.get_json(silent=True)
    if 'CLICKED_IMAGE' not in content:
        return jsonify({"message": "CLICKED_IMAGE is required"}), 401

    try:
        if content['CLICKED_IMAGE'] != ''and content['CLICKED_IMAGE'] != None and content['CLICKED_IMAGE'] != 'null':
            clicked_image = content['CLICKED_IMAGE']
            # Remove data:image/png;base64, from base64 string
            file_name = str(unique_id)  + '_' + datetime.datetime.now().strftime('%Y%m%d%H%M%S')

            file_path = configData['u_drive_path'] +  "\\Documents" + '\\' 

             # Create upload folder if not exist
            if not os.path.exists(file_path):
                os.makedirs(file_path)

            file_path = file_path + str(file_name) + '.png'
            save_base64_to_image(clicked_image, file_path)
        else:
            file_path = ''
    except Exception as e:
        file_path = ''
        pass
        print(e)

    query_string = labor_query['INSERT_INTO_DOCUMENTS'].format(
                    TYPE = 'IMAGE',
                    FILE_PATH = file_path,
                    TRANSACTION_ID = unique_id,
                )
    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(query_string)
        cnxn.commit()
        sql.close()
        return jsonify({'message': 'Image uploaded successfully'}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 401
