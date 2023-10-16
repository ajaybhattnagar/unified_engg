from flask import Flask, request, jsonify, json
from flask_cors import CORS
from functools import wraps
import pandas as pd
import numpy as np
import bcrypt
import jwt

# from utils import check_user, get_user_details


# from schedule.Parcels import update_payoff_interest_accured


from routes.login import login_blueprint
from routes.Labor import labor_blueprint


app = Flask(__name__)
app.register_blueprint(login_blueprint)
app.register_blueprint(labor_blueprint)


CORS(app)



@app.route("/")
def welcome():
    return ("Welcome to API.")




if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5000)
    app.run(debug=True)
    app.run(host='0.0.0.0', port=2277)
