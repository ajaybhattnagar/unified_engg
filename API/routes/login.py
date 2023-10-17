from flask import Flask, request, jsonify, json, Blueprint
from flask_cors import CORS
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt
import pyodbc 

login_blueprint = Blueprint('login_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

#Salt for bcrypt
salt = bcrypt.gensalt()

with open ('config.json') as f:
    configData = json.load(f)
connectionString = """Driver={}; Server={}; Database={}; uid={}; pwd={}; Trusted_Connection=no;"""





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


# Login API
@login_blueprint.route("/api/v1/login", methods=['POST'])
def login():
    content = request.get_json(silent=True)
    username = content['USERNAME'],
    username = ''.join(username).upper()
    password = content['PASSWORD'],
    password = ''.join(password)
    database = content['DATABASE']
    database = ''.join(database).upper()

    connection_string = connectionString.format(configData['sqldriver'], configData['sqlserver'], database, username, password) 
    try:
        cnxn = pyodbc.connect(connection_string)
    except Exception as e:
        return jsonify({"message": str(e)}), 401  
    
    user_object = {
        "USERNAME": username,
        "DATABASE": database,
        "CONNECTION_STRING": connection_string,
    }


    try:
        encoded_jwt = jwt.encode(user_object, configData['jwt_secret'], algorithm="HS256")
        return jsonify({"message": "Login Successfull.", "token": encoded_jwt}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401

    

