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

# Add notes
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
