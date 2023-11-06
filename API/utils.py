import pandas as pd
import numpy as np
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


with open ('config.json') as f:
    configData = json.load(f)

def send_email(email, subject, message):
    try:
        msg = MIMEMultipart()
        msg['From'] = configData['smtp_user']
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))
        server = smtplib.SMTP(configData['smtp_host'], configData['smtp_port'])
        server.starttls()
        server.login(configData['smtp_user'], configData['smtp_password'])
        text = msg.as_string()
        server.sendmail(configData['smtp_user'], email, text)
        server.quit()
        return True

    except Exception as e:
        print(e)
        return False