from flask import Flask, request, jsonify, json, Blueprint, Response
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
import bcrypt
import jwt
from utils import check_user, get_user_details

from queries.audit_query import audit_query

audit_blueprint = Blueprint('audit_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

#Salt for bcrypt
salt = bcrypt.gensalt()

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
            user_email = data['EMAIL']
        except:
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(user_email, *args, **kwargs)
    return decorator


#  Get audit history per id
@audit_blueprint.route("/api/v1/audit/<parcel_id>", methods=['GET'])
@token_required
def get_audit_data(current_user, parcel_id):
    try:
        connection = connect_database(current_user)
        mycursor = connection.cursor()

        mycursor.execute(audit_query['GET_AUDIT_DATA_PER_ID'].format(UNIQUE_ID = parcel_id))
        audit_data = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        connection.commit()
        mycursor.close()
        response = Response(
                    response=simplejson.dumps(audit_data, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
        response.headers['content-type'] = 'application/json'
        return response, 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500