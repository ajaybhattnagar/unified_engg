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
from utils import list_files, send_email, allowedFile, generate_email_template
import codecs
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from queries.email import email_query
from queries.details import details_query

quote_created_template = codecs.open("..\\API\\email_templates\\quote_created_notification.html", 'r')
quote_created_template = quote_created_template.read()

email_blueprint = Blueprint('email_blueprint', __name__)

with open ('config.json') as f:
    configData = json.load(f)

with open ('config.json') as f:
    configData = json.load(f)
connectionString = """Driver={}; Server={}; Database={}; uid={}; pwd={}; Trusted_Connection=no;"""
connectionString = connectionString.format(configData['sqldriver'], configData['sqlserver'], configData['sqldatabase'], configData['sqluser'], configData['sqlpassword'])


@email_blueprint.route('/api/v1/send_email/quotes/<quote_id>', methods=['GET', 'POST'])
def send_email(quote_id):
    quote_id = quote_id
    try:
        cnxn = pyodbc.connect(connectionString)
        sql = cnxn.cursor()
        sql.execute(email_query["GET_QUOTES_DETAILS"].format(QUOTE_ID = quote_id))
        data = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        html = quote_created_template.format(
            QUOTE_ID = data[0]['ID'],
            USER_ID = data[0]['USER_ID'],
            CREATE_DATE = data[0]['CREATE_DATE'],
            CUSTOMER_NAME = data[0]['NAME'],
            SALES_REP = data[0]['SALESREP_ID'],
            SALES_REP_EMAIL = data[0]['EMAIL_ADDR'],
            DESCRIPTION = data[0]['DESCRIPTION'],  
        )
        email = "ajay.bhattnagar21@gmail.com"
        msg = MIMEMultipart()
        msg['From'] = configData['smtp_user']
        msg['To'] = email
        msg['Subject'] = "Quote Created" + " " + data[0]['ID']
        msg.attach(MIMEText(html, 'html'))

        server = smtplib.SMTP(configData['smtp_host'], configData['smtp_port'])
        server.starttls()
        server.login(configData['smtp_user'], configData['smtp_password'])
        text = msg.as_string()
        server.sendmail(configData['smtp_user'], email, text)
        server.quit()

        # Insert into uni notifications table
        sql.execute(details_query['INSERT_INTO_UNI_NOTIFICATION'].format(
            UNIQUE_ID = data[0]['ID'], 
            RECIPIENTS = email, 
            TYPE = "new_sales_quote", 
            TEMPLATE = "quote_created_notification",
            NOTES = ""
            ))
        cnxn.commit()
        sql.close()

    except Exception as e:
        print (e, file=sys.stderr)
        return jsonify({"message": "Error sending email"}), 500
    
    return jsonify({"message": "Email sent successfully"}), 200


