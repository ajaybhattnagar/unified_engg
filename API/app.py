from flask import Flask, request, jsonify, json
from flask_cors import CORS
import mysql.connector
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt
from utils import check_user, get_user_details

from routes.login import login_blueprint
from routes.uploadParcels import upload_parcels_blueprint

from queries.db_query import db_query


app = Flask(__name__)
app.register_blueprint(login_blueprint)
app.register_blueprint(upload_parcels_blueprint)
CORS(app)

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
# def token_required(f):
#     @wraps(f)
#     def decorator(*args, **kwargs):
#         token = None
#         # ensure the jwt-token is passed with the headers
#         if 'x-access-token' in request.headers:
#             token = request.headers['x-access-token']
#         if not token: # throw error if no token provided
#             return jsonify({"message": "A valid token is missing!"}), 401
#         try:
#            # decode the token to obtain user public_id
#             data = jwt.decode(token, configData['jwt_secret'], algorithms=['HS256'])
#             current_user = get_user_details(data['EMAIL'])
#         except:
#             return jsonify({"message": "Invalid token!"}), 401
#          # Return the user information attached to the token
#         return f(current_user, *args, **kwargs)
#     return decorator


@app.route("/")
def welcome():
    return ("Welcome to API.")



if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5000)
    app.run(debug=True)
    app.run(host='0.0.0.0', port=2277)
