import pandas as pd
import numpy as np
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import base64, binascii


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
    

def save_base64_to_image(base, file_name):
    image = base64.b64decode(base, validate=True)
    file_to_save = configData['save_images_to_folder'] + file_name + '.png'
    with open(file_to_save, "wb") as f:
        f.write(image)


def allowedFile(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in configData['allowed_extenstions']

