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
from queries.purchasing import purchasing_query
import os
from utils import list_files, send_email


purchasing_blueprint = Blueprint('purchasing_blueprint', __name__)

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

@purchasing_blueprint.route("/api/v1/purchasing/get_purchase_order", methods=['GET'])
@token_required
def get_purchase_order(connection_string, username):
    cnxn = pyodbc.connect(connection_string)
    
    # Get Purchase Order param
    purchase_order = request.args.get('purchase_order')

    try:
        if purchase_order:
            sql = cnxn.cursor()
            sql.execute(purchasing_query['GET_PURCHASE_ORDER_BY_ID'].format(ID = purchase_order))
            po_details = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            sql.close()
            response = Response(
                    response=simplejson.dumps(po_details, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
            response.headers['content-type'] = 'application/json'
            return response, 200

        else:
            sql = cnxn.cursor()
            sql.execute(purchasing_query['GET_PURCHASE_ORDER_R_F'].format(ID = purchase_order))
            all_purchase_orders = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
            sql.close()
            response = Response(
                    response=simplejson.dumps(all_purchase_orders, ignore_nan=True,default=datetime.datetime.isoformat),
                    mimetype='application/json'
                )
            response.headers['content-type'] = 'application/json'
            return response, 200

            
        

    except Exception as e:
        return jsonify({"message": str(e)}), 401


@purchasing_blueprint.route("/api/v1/purchasing/notify_buyer", methods=['POST'])
@token_required
def test_smtp(connection_string, username):
    content = request.get_json(silent=True)
    try:
        if 'EMAIL' not in content:
            return jsonify({"message": "EMAIL is required"}), 401
        else:
            email = content['EMAIL'],
            email = ''.join(email)
        if 'PO_NUMBER' not in content:
            return jsonify({"message": "PO Number is required"}), 401
        else:
            po_number = content['PO_NUMBER']
            po_number = ''.join(po_number)

        subject = "Purchase Order Notification"
        template = 'purchase_order_notification'
       
        try:
            send_email(template, email, subject, connection_string, po_number)
            return jsonify({"message": "Email Sent Successfully!"}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 401

    except Exception as e:
        return jsonify({"message": str(e)}), 401