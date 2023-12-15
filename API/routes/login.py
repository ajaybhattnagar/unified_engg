from flask import Flask, request, jsonify, json, Blueprint, Response
from flask_cors import CORS
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt
import pyodbc 
import simplejson
import datetime
import time 


from queries.users import user_query

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
            username = str(data['USERNAME'])
            data = str(data['CONNECTION_STRING'])
        except Exception as e:
            print (e)
            return jsonify({"message": "Invalid token!"}), 401
         # Return the user information attached to the token
        return f(data, username , *args, **kwargs)
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
        sql = cnxn.cursor()
        sql.execute(user_query['ADD_USER_IF_NOT_EXIST'].format(EMP_ID=username))
        
        sql.execute(user_query['GET_USER_DETAILS'].format(EMP_ID=username))
        user_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        # Update column create date to string
        user_details[0]['CREATE_DATE'] = str(user_details[0]['CREATE_DATE'])
        
        cnxn.commit()
        sql.close()
    except Exception as e:
        return jsonify({"message": str(e)}), 401  


    user_object = {
        "USERNAME": username,
        "DATABASE": database,
        "CONNECTION_STRING": connection_string,
        "PASSWORD": password,
        "USER_DETAILS": user_details[0],
        "EXP": int(time.time() + 172800)
    }
    
    try:
        encoded_jwt = jwt.encode(user_object, configData['jwt_secret'], algorithm="HS256")
        return jsonify({"message": "Login Successfull.", "token": encoded_jwt}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 401

    
# Get all users API
@login_blueprint.route("/api/v1/users", methods=['GET', 'POST'])
@token_required
def users(connection_string, username):
    if request.method == 'GET':
        try:
            cnxn = pyodbc.connect(connection_string)
            sql = cnxn.cursor()
            sql.execute(user_query['GET_ALL_USERS'])
            users = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            sql.close()

            response = Response(
                        response=simplejson.dumps(users, ignore_nan=True,default=datetime.datetime.isoformat),
                        mimetype='application/json'
                    )
            response.headers['content-type'] = 'application/json'
            return response, 200

        except Exception as e:
            return jsonify({"message": str(e)}), 401
    
    if request.method == 'POST':
        content = request.get_json(silent=True)
        # Convert content to dataframe
        df = pd.DataFrame(content)
        df = df.replace(np.nan, '', regex=True)

        # Reset index
        df.reset_index(inplace=True)
        
        for i in range(len(df)):
            try:
                cnxn = pyodbc.connect(connection_string)
                sql = cnxn.cursor()
                user_query_string = user_query['UPDATE_USERS'].format(
                    FIRST_NAME = df['FIRST_NAME'][i],
                    LAST_NAME = df['LAST_NAME'][i],
                    DASHBOARD = 1 if df['DASHBOARD'][i] == True else 0,
                    ADMIN = 1 if df['ADMIN'][i] == True else 0,
                    SUPER_ADMIN = 1 if df['SUPER_ADMIN'][i] == True else 0,
                    ALLOWED_WORKING_LOCATION = 1 if df['ALLOWED_WORKING_LOCATION'][i] == True else 0,
                    ALLOWED_WORKING_TIME = 1 if df['ALLOWED_WORKING_TIME'][i] == True else 0,
                    ALLOWED_APPROVE_PAGE = 1 if df['ALLOWED_APPROVE_PAGE'][i] == True else 0,
                    ALLOWED_EDIT_LABOR_TICKET =  1 if df['ALLOWED_EDIT_LABOR_TICKET'][i] == True else 0,
                    ROWID = df['ROWID'][i]
                )
                sql.execute(user_query_string)
                cnxn.commit()
                sql.close()

            except Exception as e:
                print (e)
                return jsonify({"message": str(e)}), 401
            
        return jsonify({"message": "Users updated successfully."}), 200


        


