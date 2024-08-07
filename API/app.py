from flask import Flask, request, jsonify, json
from flask_cors import CORS
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt


from routes.login import login_blueprint
from routes.Labor import labor_blueprint
from routes.Details import details_blueprint
from routes.Purchasing import purchasing_blueprint
from routes.Quotes import quotes_blueprint
from routes.Email import email_blueprint


app = Flask(__name__)
app.register_blueprint(login_blueprint)
app.register_blueprint(labor_blueprint)
app.register_blueprint(details_blueprint)
app.register_blueprint(purchasing_blueprint)
app.register_blueprint(quotes_blueprint)
app.register_blueprint(email_blueprint)



CORS(app)
CORS(app, expose_headers='Content-Disposition')



@app.route("/")
def welcome():
    return ("Welcome to API.")




if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5000)
    app.run(debug=True)
    app.run(host='localhost', port=2277)
