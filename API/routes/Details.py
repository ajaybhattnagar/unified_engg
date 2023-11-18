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

        sql.close()

        response_dict = {
            "ACTIVE_LABOR_TICKETS": active_labor,
            "EMPLOYEE_KPI": employee_kpi
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
        sql.close()
        response = Response(
                    response=simplejson.dumps(labor_tickets, ignore_nan=True,default=datetime.datetime.isoformat),
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