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

from queries.documents_query import documents_query

documents_blueprint = Blueprint('documents_blueprint', __name__)

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


# Add notes
@documents_blueprint.route("/api/v1/document/add/<parcel_id>", methods=['POST'])
@token_required
def add_document(current_user, parcel_id):
    content = request.get_json(silent=True)
    # Add notes to a parcel   
    try:
        connection = connect_database(current_user)
        mycursor = connection.cursor()
        mycursor.execute(documents_query['INSERT_DOCUMENTS'].format(UNIQUE_ID = parcel_id, TITLE = content['TITLE'], LINK = content['LINK']))
        connection.commit()
        mycursor.close()
        return jsonify({"message": "Document added successfully!"}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500


# Delete a note
@documents_blueprint.route("/api/v1/document/delete/<note_id>", methods=['DELETE'])
@token_required
def delete_parcel(current_user, note_id):
    try:
        connection = connect_database(current_user)
        mycursor = connection.cursor()
        mycursor.execute(documents_query['DELETE_NOTES_BY_ID'].format(ID = note_id))
        connection.commit()
        mycursor.close()
        return jsonify({"message": "Document deleted successfully!"}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500
    


@documents_blueprint.route("/api/v1/test", methods=['GET'])
@token_required
def test(current_user):
    try:
        connection = connect_database(current_user)
        mycursor = connection.cursor()
        mycursor.execute('SELECT CURRENT_USER')
        parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        print(parcel_fees)
        connection.commit()
        mycursor.close()
        return jsonify({"message": "Document deleted successfully!"}), 200
    except:
        return jsonify({"message": "Something went wrong!"}), 500