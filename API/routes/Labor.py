from flask import Flask, request, jsonify, json, Blueprint, Response, send_file, make_response
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
import math
import csv
from csv2pdf import convert

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

        # If data for visual ticket is required
        if 'DATA_FOR_VISUAL_TICKET' in content:
            query_string = details_query['GET_DATA_FOR_CREATING_LABOR_TICKET_IN_VISUAL']
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

        # All other Tickets
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
                employee_id = "AND ULAB.EMPLOYEE_ID = '{}'".format(employee_id)

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
        print (e)
        return jsonify({"message": str(e)}), 401

@labor_blueprint.route("/api/v1/labor/get_labor_tickets/<export_type>", methods=['POST'])
@token_required
def export_labor_tickets(connection_string, username, export_type):
    export_type = export_type
    content = request.get_json(silent=True)
    try:

        # If data for visual ticket is required
        if 'DATA_FOR_VISUAL_TICKET' in content:
            query_string = details_query['GET_DATA_FOR_CREATING_LABOR_TICKET_IN_VISUAL']
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

        # All other Tickets
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
                employee_id = "AND ULAB.EMPLOYEE_ID = '{}'".format(employee_id)

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

        # Gettin min and max clock in and clock out 
        min_date = min([x['CLOCK_IN'] for x in results])
        max_date = max([x['CLOCK_OUT'] for x in results])

        # Keep Required Columns
        columns_req = ["TRANSACTION_ID", "WORKORDER_BASE_ID", "LOT_SPLIT_SUB", "SEQUENCE_NO", "INDIRECT_ID" , "HOURS_WORKED", "WORK_TIME",
                       "QA_NOTES", "LAB_DESC", "CUSTOMER_ID"]
        results = [{k: v for k, v in d.items() if k in columns_req} for d in results]
        for row in results:
            row["WORKORDER"] = str(row["WORKORDER_BASE_ID"]) + " - " +  row["LOT_SPLIT_SUB"] + " - " + str(row["SEQUENCE_NO"])
        # Rename Columns
        columns_rename = {
            "TRANSACTION_ID": "TRANSACTION_ID",
            "WORKORDER": "WORKORDER",
            "CUSTOMER_ID": "CUSTOMER",
            "INDIRECT_ID": "INDIRECT_ID",
            "HOURS_WORKED": "HOURS_WORKED",
            "WORK_TIME": "WORK_TIME",
            "QA_NOTES": "QA_NOTES",
            "LAB_DESC": "NOTES",
        }
        results = [{columns_rename.get(k, k): v for k, v in d.items()} for d in results]

        # Drop Columns
        columns_drop = ["WORKORDER_BASE_ID", "LOT_SPLIT_SUB", "SEQUENCE_NO"]
        results = [{k: v for k, v in d.items() if k not in columns_drop} for d in results]

        # Convert to dataframe
        df = pd.DataFrame(results)
         # Reorder Columns
        columns_order = ["TRANSACTION_ID", "WORKORDER", "CUSTOMER", "INDIRECT_ID", "HOURS_WORKED", "WORK_TIME", "QA_NOTES", "NOTES"]
        df = df[columns_order]

        # Convert min_date to YYYY-MM-DD_NAME_EOD 
        min_date_file_name = datetime.datetime.strptime(min_date, '%m/%d/%y %I:%M:%S %p')
        min_date_file_name = min_date_file_name.strftime('%Y-%m-%d')
        file_name = min_date_file_name + "_" + username + "_EOD"
       
        if export_type == 'csv':
            # Export to excel
            file_path = "static/" + file_name + ".csv"
            df.to_csv(file_path, index=False)

            # Reopen file and add username, clock in and clock out
            with open(file_path, 'r') as readFile:
                rd = csv.reader(readFile)
                lines = list(rd)
                lines.insert(0, ['EMPLOYEE', username])
                lines.insert(1, ['CLOCK_IN', min_date])
                lines.insert(2, ['CLOCK_OUT', max_date])

            with open(file_path, 'w',newline='') as writeFile:
                wt = csv.writer(writeFile)
                wt.writerows(lines)

            readFile.close()
            writeFile.close()

        if export_type == 'csv':
            return send_file(file_path, as_attachment=True, download_name=file_name + ".csv")

        if export_type == 'pdf':
            convert("static\\" + file_name + ".csv", "static\\" + file_name + ".pdf" , orientation="L", size=4)
            return send_file("static\\" + file_name + ".pdf", as_attachment=True, download_name=file_name + ".pdf")

            # Send file to download
            # return send_file(file_path, as_attachment=True, download_name=file_name + ".csv")

    except Exception as e:
        print (e)
        return jsonify({"message": str(e)}), 401
    

@labor_blueprint.route("/api/v1/labor/get_labor_tickets_summary_approved", methods=['POST'])
@token_required
def get_labor_tickets_summary_by_approved_not_approved(connection_string, username):

    content = request.get_json(silent=True)
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

    try:
        query_string = details_query['GET_LABOR_TICKET_SUMMARY_BY_APPROVED_NOT_APPROVED'].format(FROM_DATE=from_date, TO_DATE = to_date)
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
                    WORK_TIME = content['WORK_TIME'] if 'WORK_TIME' in content else '',
                    # REGULAR_TIME = 1 if 'regular' in content['WORK_TIME'].lower() else 0,
                    # OVER_TIME = 1 if 'over' in content['WORK_TIME'].lower() else 0,
                    # DOUBLE_TIME = 1 if 'double' in content['WORK_TIME'].lower() else 0,
                    QA_NOTES = content['QA_NOTES'] if 'QA_NOTES' in content else '',
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
                    WORK_TIME = content['WORK_TIME'] if 'WORK_TIME' in content else '',
                    QA_NOTES = content['QA_NOTES'] if 'QA_NOTES' in content else '',
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
                if 'QA_NOTES' in content and content['QA_NOTES'] != '' and content['QA_NOTES'] != None and content['QA_NOTES'] != 'null':
                    email = configData['QA_email']
                    send_email('labor_ticket_start', configData['QA_email'], connection_string , transaction_id, '')
            except Exception as e:
                print(e)
                pass

            # Sending email if QA emails in UNI_QUALITY_UPDATES
            try:
                cnxn = pyodbc.connect(connection_string)
                sql = cnxn.cursor()
                sql.execute(details_query['GET_QUALITY_UPDATES'].format(BASE_ID = content['WORKORDER_ID'], SUB_ID = content['WORKORDER_SUB_ID']))
                results = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]

                # Filter results to sequence number and email is not null
                results = [x for x in results if x['SEQUENCE_NO'] == int(content['OPERATION_SEQ_NO'])]
                results = [x for x in results if x['NOTIFY_EMPLOYEE'] != '']
                
                for row in results:
                    email = row['NOTIFY_EMPLOYEE']
                    send_email('qa_email_added', email, connection_string , transaction_id, '')
                sql.close()

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

    # Get timestamp duration from server
    query_string = labor_query['GET_TIMESTAMP_DURATION_SERVER'].format(TRANSACTION_ID = content['TRANSACTION_ID'])

    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(query_string)
        results = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        timestamp_duration = results[0]['DURATION'] / 60

        # Round up to nearest highest quarter
        timestamp_duration =  math.ceil(timestamp_duration * 4) / 4
        
        # Update labor ticket
        query_string = labor_query['STOP_LABOR_TICKET'].format(
            TRANSACTION_ID = content['TRANSACTION_ID'],
            HOURS_WORKED = timestamp_duration,
        )
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()

        sql.execute(query_string)
        cnxn.commit()
        sql.close()
        return jsonify({"message": "Ticket Stopped Successfully!"}), 200
   
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

            sql.execute(labor_query['GET_USER_CLOCK_IN_DETAILS'].format(EMP_ID = username))
            emp_clock_in_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            
            dict_results = {
                'last_30_tickets': results,
                'active_labor_ticket': active_labor_ticket,
                'employee_kpis': employee_kpis,
                'all_workorders_list': all_workorders_list,
                "emp_clock_in_details": emp_clock_in_details,
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
    
    for index, row in df.iterrows():
        
        if df['APPROVED'][index] == True:
            approved_by = username
            approved_at = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        else:
            approved_by = ''
            approved_at = ''

        query_string = labor_query['UPDATE_LABOR_TICEKT'].format(
            HOURS_WORKED = df['HOURS_WORKED'][index] if 'HOURS_WORKED' in df.columns else 0,
            DESCRIPTION = df['LAB_DESC'][index],
            UDF1 = df['UDF1'][index],
            UDF2 = df['UDF2'][index],
            UDF3 = df['UDF3'][index],
            UDF4 = df['UDF4'][index],
            # Manage true as 1 and false as 0
            APPROVED = 1 if df['APPROVED'][index] == True else 0,
            APPROVED_BY = approved_by,
            APPROVED_AT = approved_at,
            WORK_LOCATION = df['WORK_LOCATION'][index] if 'WORK_LOCATION' in df.columns else '',
            WORK_TIME = df['WORK_TIME'][index] if 'WORK_TIME' in df.columns else '',
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


@labor_blueprint.route("/api/v1/labor/upload_document/<trans_id>", methods=['POST'])
@token_required
def upload_document(connection_string, username, trans_id):
    file = request.files.getlist('file')
    transaction_id = trans_id
    try:
        for f in file:
            filename = secure_filename(f.filename)
            if allowedFile(filename):
                
                #Get base id for transaction id
                cnxn = pyodbc.connect(connection_string)
                sql = cnxn.cursor()
                sql.execute("SELECT TOP 1 RIGHT(WORKORDER_BASE_ID, LEN(WORKORDER_BASE_ID) - 1) AS [STRIPPED_BASE_ID] FROM UNI_LABOR_TICKET WHERE WORKORDER_TYPE = 'W' AND TRANSACTION_ID = {ID}".format(ID = trans_id))
                base_id = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
                s_base_id = base_id[0]['STRIPPED_BASE_ID']

                file_path = configData['u_drive_path'] + "\\Q" + s_base_id + "\\" + "Upload"

                # Create upload folder if not exist
                if not os.path.exists(file_path):
                    os.makedirs(file_path)

                file_path = os.path.join(file_path, filename)
                f.save(file_path)

                # Update database with file path
                query_string = labor_query['INSERT_INTO_DOCUMENTS'].format(
                    TYPE = 'DOCUMENT',
                    FILE_PATH = file_path,
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


@labor_blueprint.route("/api/v1/labor/upload_image/<trans_id>", methods=['POST'])
@token_required
def upload_image(connection_string, username, trans_id):
    content = request.get_json(silent=True)
    if 'CLICKED_IMAGE' not in content:
        return jsonify({"message": "CLICKED_IMAGE is required"}), 401

    try:
        if content['CLICKED_IMAGE'] != ''and content['CLICKED_IMAGE'] != None and content['CLICKED_IMAGE'] != 'null':
            clicked_image = content['CLICKED_IMAGE']
            # Remove data:image/png;base64, from base64 string
            file_name = str(trans_id)  + '_' + datetime.datetime.now().strftime('%Y%m%d%H%M%S')

             #Get base id for transaction id
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute("SELECT TOP 1 RIGHT(WORKORDER_BASE_ID, LEN(WORKORDER_BASE_ID) - 1) AS [STRIPPED_BASE_ID] FROM UNI_LABOR_TICKET WHERE WORKORDER_TYPE = 'W' AND TRANSACTION_ID = {ID}".format(ID = trans_id))
            base_id = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            s_base_id = base_id[0]['STRIPPED_BASE_ID']

            file_path = configData['u_drive_path'] + "\\Q" + s_base_id + "\\" + "Upload"

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
                    TRANSACTION_ID = trans_id,
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


@labor_blueprint.route("/api/v1/labor/clock_in_out/<type>", methods=['POST', 'GET', 'PUT'])
@token_required
def clock_in_out(connection_string, username, type):
    if type == '':
        return jsonify({"message": "Type is required"}), 401

    if type.lower() == 'clock_in':
        #run query to update clock in
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(labor_query['INSERT_INTO_UNI_USERS_LOGIN'].format(EMP_ID = username))
        cnxn.commit()
        sql.close()
        return jsonify({'message': 'Clocked in successfully!'}), 200
    
    elif type.lower() == 'clock_out':
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(labor_query['UPDATE_CLOCK_OUT_TIME'].format(EMP_ID = username))
        cnxn.commit()
        sql.close()
        return jsonify({'message': 'Clocked out successfully!'}), 200
    else:
        return jsonify({"message": "Type is invalid"}), 401
    
@labor_blueprint.route("/api/v1/labor/update_labor_ticket/<field>", methods=['POST'])
@token_required
def update_labor_ticket_field(connection_string, username, field):
    content = request.get_json(silent=True)

    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(labor_query['UPDATE_FIELD_LABOR_TICKET'].format(FIELD = field, FIELD_VALUE = content['VALUE'], TRANSACTION_ID = content['TRANSACTION_ID']))
        cnxn.commit()
        sql.close()
        return jsonify({'message': 'Ticket updated successfully!'}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 401

@labor_blueprint.route("/api/v1/labor/duplicate_labor_ticket/<trans_id>", methods=['POST'])
@token_required
def duplicate_labor_ticket_field(connection_string, username, trans_id):
    content = request.get_json(silent=True)

    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(labor_query['DUPLICATE_LABOUR_TICKET'].format(TRANSACTION_ID = trans_id))
        cnxn.commit()
        sql.close()
        return jsonify({'message': 'Success!'}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 401

@labor_blueprint.route("/api/v1/labor/delete_labor_ticket/<trans_id>", methods=['POST'])
@token_required
def delete_labor_ticket_field(connection_string, username, trans_id):
    content = request.get_json(silent=True)

    try:
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(labor_query['DELETE_LABOUR_TICKET'].format(TRANSACTION_ID = trans_id))
        cnxn.commit()
        sql.close()
        return jsonify({'message': 'Successfully deleted labour ticket!'}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 401
   
@labor_blueprint.route("/api/v1/details/labour_summary_report", methods=['GET'])
@token_required
def labour_summary_report(connection_string, username):
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    filter_type = request.args.get('filter_type') # ALL, VISUAL LABOUR, APPROVED, NOT APPROVED
    cnxn = pyodbc.connect(connection_string)

    if filter_type == 'VISUAL':
        query_string = labor_query['LABOUR_SUMMARY_VISUAL_TICKETS'].format(FROM_DATE = from_date, TO_DATE = to_date)
    elif filter_type == 'APPROVED':
        query_string = labor_query['LABOUR_SUMMARY_SUDO_TABLE_FILTER'].format(FROM_DATE = from_date, TO_DATE = to_date, APPROVED_STRING = 'AND APPROVED = 1')
    elif filter_type == 'NOT_APPROVED':
        query_string = labor_query['LABOUR_SUMMARY_SUDO_TABLE_FILTER'].format(FROM_DATE = from_date, TO_DATE = to_date, APPROVED_STRING = 'AND APPROVED = 0')
    elif filter_type == 'ALL':
        query_string = labor_query['LABOUR_SUMMARY_SUDO_TABLE_FILTER'].format(FROM_DATE = from_date, TO_DATE = to_date, APPROVED_STRING = '')
    else:
        return jsonify({"message": "Filter type is required"}), 401

    try:
        sql = cnxn.cursor()
        sql.execute(query_string)
        labour_summary_report = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        
        # Conver to dataframe
        df = pd.DataFrame(labour_summary_report)

        columns = df.columns.tolist()
        columns.remove('Employee ID')
        columns.remove('First Name')
        columns.remove('Last Name')
        columns.remove('External ID')
        # Convert all the columns to numeric
        df[columns] = df[columns].apply(pd.to_numeric)
        # Add total row
        df.loc['Summary'] = df[columns].sum()
        df.loc['Summary', 'Last Name'] = 'TOTAL'
        
        # External ID colums as blank
        df['External ID'] = ''

        # Add first row as start and end date
        df.loc['Summary', 'Employee ID'] = 'Start Date: ' + from_date + ' End Date: ' + to_date

        # Converting back to dictionary
        labour_summary_report = df.to_dict(orient='records')

        sql.close()
        response = Response(
                    response=simplejson.dumps(labour_summary_report, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401 




