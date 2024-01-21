import pandas as pd
import numpy as np
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import base64, binascii
import os


with open ('config.json') as f:
    configData = json.load(f)

labor_ticket_start_template = """<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">

            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

                <p style="color: #666; text-align: center;">Hello,</p>

                <p style="color: #666; text-align: center;">Please review the ticket below</p>

                <p style="text-align: center;">
                    <a href="{url}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Ticket</a>
                </p>

                <p style="color: #666; text-align: center;">Thank you</p>

            </div>

        </body>
        </html>"""

qa_email_added_template = """<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">

            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

                <p style="color: #666; text-align: center;">Hello,</p>

                <p style="color: #666; text-align: center;">Please review the ticket below</p>

                <p style="text-align: center;">
                    <a href="{url}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Ticket</a>
                </p>

                <p style="color: #666; text-align: center;">Thank you</p>

            </div>

        </body>
        </html>"""

purchase_order_notification_template = """<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">

            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

                <p style="color: #666; text-align: center;">Hello,</p>

                <p style="color: #666; text-align: center;">Order in receiving</p>

                <p style="text-align: center;">
                    <span style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">{PO_NUMBER}</span>
                </p>

                <p style="color: #666; text-align: center;">Thank you</p>

            </div>

        </body>
        </html>"""

def send_email(type, email, subject, transaction_id):
    try:
        msg = MIMEMultipart()
        msg['From'] = configData['smtp_user']
        msg['To'] = email
        msg['Subject'] = subject

        url_ticket = '{BASE_DEPLOYMENT_URL}/ticket_details?transaction_id={TRANSACTION_ID}'.format(BASE_DEPLOYMENT_URL = configData['deployment_url_front_end'], TRANSACTION_ID=transaction_id)

        if type == 'labor_ticket_start':
            html_content = labor_ticket_start_template.format(url=url_ticket)
        if type == 'qa_email_added':
            html_content = qa_email_added_template.format(url=url_ticket)
        if type == 'purchase_order_notification':
            html_content = purchase_order_notification_template.format(PO_NUMBER=transaction_id)

        msg.attach(MIMEText(html_content, 'html'))
        server = smtplib.SMTP(configData['smtp_host'], configData['smtp_port'])
        server.starttls()
        server.login(configData['smtp_user'], configData['smtp_password'])
        text = msg.as_string()
        server.sendmail(configData['smtp_user'], email, text)
        server.quit()
        return True

    except Exception as e:
        print(str(e))
        return False
    

def save_base64_to_image(base, file_name):
    image = base64.b64decode(base, validate=True)
    file_to_save = configData['save_images_to_folder'] + file_name + '.png'
    with open(file_to_save, "wb") as f:
        f.write(image)


def allowedFile(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in configData['allowed_extenstions']

def list_files(root_folder):
    # Iterate through all files and subfolders using os.walk
    for folder_path, subfolders, files in os.walk(root_folder):
        for file_name in files:
            # Create the full file path using os.path.join
            file_path = os.path.join(folder_path, file_name)
            yield file_path
