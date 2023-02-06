from flask import Flask, request, jsonify, json, Blueprint
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt
from utils import check_user, get_user_details

from queries.db_query import db_query

login_blueprint = Blueprint('login_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

#Salt for bcrypt
salt = bcrypt.gensalt()

try:
    mydb = mysql.connector.connect(
        host = configData['host'],
        user = configData['user'],
        password = configData['password'],
        database = configData['database']
    )
except mysql.connector.Error as err:
   print("Something went wrong: {}".format(err))



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
        except:
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(current_user, *args, **kwargs)
    return decorator


# Register API
@login_blueprint.route("/api/v1/register", methods=['POST'])
def register():
    content = request.get_json(silent=True)
    email = content['EMAIL'],
    password = content['PASSWORD'],

    # Convert tuple to string
    email = ''.join(email).lower()
    password = ''.join(password).encode('UTF-8')
    hashed_password = bcrypt.hashpw(password, salt)
    hashed_password = hashed_password.decode('UTF-8')

    try:
        # Check if user already exists
        user_exists = check_user(email)
        if user_exists == 1:
            return jsonify({"message": "User already exists."}), 401

        # Update database
        mycursor = mydb.cursor()
        mycursor.execute(db_query['REGISTER_USER'].format(EMAIL=email, PASSWORD=hashed_password))
        mydb.commit()
        mycursor.close()
        return jsonify({"message": "User registered successfully."}), 200

    except:
        return jsonify({"message": "Something went wrong. Please try again later."}), 500


# Login API
@login_blueprint.route("/api/v1/login", methods=['POST'])
def login():
    content = request.get_json(silent=True)
    email = content['EMAIL'],
    email = ''.join(email).lower()
    password = content['PASSWORD'],
    password = ''.join(password).encode('UTF-8')

    # Check if user exists
    user_exists = check_user(email)
    if user_exists == 0:
        return jsonify({"message": "User does not exist."}), 401

    # Get user details and password from database
    user_details = get_user_details(email)

    #Return error if user does not exist
    if user_details.empty:
        return jsonify({"message": "User does not exist."}), 401
    
    # Convert password to bytes
    password_hashed = user_details['PASSWORD'][0].encode('UTF-8')
    
    # Convert dataframe for payload
    user_details = user_details.drop(columns=["PASSWORD", "CREATE_DATE", "LAST_MODIFY_DATE"])
    user_details = user_details.to_dict(orient="records")

    # Compare passwords
    if bcrypt.checkpw(password, password_hashed):
        encoded_jwt = jwt.encode(user_details[0], configData['jwt_secret'], algorithm="HS256")
        return jsonify({"message": "Login Successfull.", "token": encoded_jwt}), 200
    else:
        return jsonify({"message": "Incorrect password."}), 401
