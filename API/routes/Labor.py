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
import pyodbc 
from utils import check_user, get_user_details

from queries.notes_query import notes_query

labor_blueprint = Blueprint('labor_blueprint', __name__)

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
@labor_blueprint.route("/api/v1/labor/test", methods=['GET'])
@token_required
def add_parcel(connection_string):
    cnxn = pyodbc.connect(connection_string)
    # Add notes to a parcel   
    try:
        sql = cnxn.cursor()
        sql.execute("SELECT TOP 100 * FROM CUSTOMER_ORDER")
        myresult = sql.fetchall()

        print (myresult)
        return jsonify({"message": "myresult"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401

