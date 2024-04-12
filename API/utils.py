import pandas as pd
import numpy as np
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import base64, binascii
import os
import pyodbc
from queries.details import details_query
import codecs


with open ('config.json') as f:
    configData = json.load(f)

labor_ticket_start_template = codecs.open("email_templates\\labour_ticket_qa_note.html", 'r')
labor_ticket_start_template = labor_ticket_start_template.read()

qa_email_added_template = codecs.open("email_templates\\work_order_sign_in_notification.html", 'r')
qa_email_added_template = qa_email_added_template.read()

purchase_order_notification_template = codecs.open("email_templates\\received_po_notification.html", 'r')
purchase_order_notification_template = purchase_order_notification_template.read()

def generate_email_template(template, unique_id, connection_string):
    url_ticket = '{BASE_DEPLOYMENT_URL}/ticket_details?transaction_type=labor_ticket&transaction_id={unique_id}'.format(BASE_DEPLOYMENT_URL = configData['deployment_url_front_end'], unique_id=unique_id)

    # ************************************************************************************
    if template == 'labor_ticket_start':
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute("""SELECT CONVERT(VARCHAR, LAB.CREATE_DATE, 100) AS [CLOCK_IN], LAB.WORKORDER_BASE_ID , LAB.EMPLOYEE_ID, LAB.QA_NOTES, EMP.FIRST_NAME,
                        RIGHT(LAB.WORKORDER_BASE_ID, LEN(LAB.WORKORDER_BASE_ID) - 1) AS [STRIPPED_BASE_ID]
                        FROM UNI_LABOR_TICKET LAB
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = LAB.EMPLOYEE_ID
                        WHERE TRANSACTION_ID = '{}'""".format(unique_id))
        data = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        cnxn.close()
        html = labor_ticket_start_template.format(
            EMPLOYEE_NAME = data[0]['FIRST_NAME'],
            EMPLOYEE_ID = data[0]['EMPLOYEE_ID'],
            BASE_ID = data[0]['WORKORDER_BASE_ID'],
            DATE_TIME = data[0]['CLOCK_IN'],
            NOTES = data[0]['QA_NOTES'],
            FOLDER_PATH = configData['u_drive_path'] + "\\Q" + data[0]['STRIPPED_BASE_ID'] + "\\" + "Upload",
            url = url_ticket
        )
        subject = """{BASE_ID}, {EMPLOYEE_NAME} - Labour Ticket QA Notes""".format(BASE_ID = data[0]['WORKORDER_BASE_ID'], EMPLOYEE_NAME = data[0]['FIRST_NAME'])
        return html, subject
    
    # ************************************************************************************
    if template == 'qa_email_added':
        url_ticket = '{BASE_DEPLOYMENT_URL}/ticket_details?transaction_type=labor_ticket&transaction_id={unique_id}'.format(BASE_DEPLOYMENT_URL = configData['deployment_url_front_end'], unique_id=unique_id)
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute("""SELECT TOP 1 CONVERT(VARCHAR, LAB.CLOCK_IN, 100) AS [CLOCK_IN], LAB.WORKORDER_BASE_ID, LAB.WORKORDER_LOT_ID, LAB.WORKORDER_SPLIT_ID, LAB.WORKORDER_SUB_ID,
                        LAB.EMPLOYEE_ID, LAB.QA_NOTES, EMP.FIRST_NAME, LAB.TRANSACTION_ID,
                                UQ.NOTIFY_EMPLOYEE, UQ.EMPLOYEE_ID, EMP.FIRST_NAME, SP.DESCRIPTION, LAB.OPERATION_SEQ_NO
                        FROM UNI_LABOR_TICKET LAB
                        LEFT JOIN UNI_QUALITY_UPDATES UQ ON UQ.WORKORDER_TYPE = 'W' AND  LAB.WORKORDER_BASE_ID = UQ.WORKORDER_BASE_ID AND LAB.WORKORDER_LOT_ID = UQ.WORKORDER_LOT_ID AND LAB.WORKORDER_SPLIT_ID = UQ.WORKORDER_SPLIT_ID AND
                            LAB.WORKORDER_SUB_ID = UQ.WORKORDER_SUB_ID AND LAB.OPERATION_SEQ_NO = UQ.OPERATION_SEQ_NO
                        LEFT JOIN OPERATION OP ON UQ.WORKORDER_TYPE = 'W' AND  OP.WORKORDER_BASE_ID = UQ.WORKORDER_BASE_ID AND OP.WORKORDER_LOT_ID = UQ.WORKORDER_LOT_ID AND OP.WORKORDER_SPLIT_ID = UQ.WORKORDER_SPLIT_ID AND
                            OP.WORKORDER_SUB_ID = UQ.WORKORDER_SUB_ID AND OP.SEQUENCE_NO = UQ.OPERATION_SEQ_NO
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = LAB.EMPLOYEE_ID
                        LEFT JOIN SHOP_RESOURCE SP ON SP.ID = OP.RESOURCE_ID
                        WHERE TRANSACTION_ID = '{}'""".format(unique_id))
        # Convert data to dictionary
        data = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        cnxn.close()

        html = qa_email_added_template.format(
            EMPLOYEE_NAME = data[0]['FIRST_NAME'],
            EMPLOYEE_ID = data[0]['EMPLOYEE_ID'],
            BASE_ID = data[0]['WORKORDER_BASE_ID'],
            LOT_ID = data[0]['WORKORDER_LOT_ID'],
            SPLIT_ID = data[0]['WORKORDER_SPLIT_ID'],
            SUB_ID = data[0]['WORKORDER_SUB_ID'],
            OPERATION_NO = data[0]['OPERATION_SEQ_NO'],
            OPERATION_DESC = data[0]['DESCRIPTION'],
            START_TIME = data[0]['CLOCK_IN'],
            FOLDER_PATH =  configData['u_drive_path'] +  "\\Documents" + '\\',
            url = url_ticket
        )
        subject = """{BASE_ID}, {EMPLOYEE_NAME} - Work Order Sign-In Notification""".format(BASE_ID = data[0]['WORKORDER_BASE_ID'], EMPLOYEE_NAME = data[0]['FIRST_NAME'])
        return html, subject

    # ************************************************************************************
    if template == 'purchase_order_notification':
        url_ticket = '{BASE_DEPLOYMENT_URL}/ticket_details?transaction_type=labor_ticket&transaction_id={unique_id}'.format(BASE_DEPLOYMENT_URL = configData['deployment_url_front_end'], unique_id=unique_id)
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute("""SELECT PO.ID, POL.LINE_NO, POL.PART_ID, DSL.DEMAND_BASE_ID, DSL.DEMAND_LOT_ID, DSL.DEMAND_SPLIT_ID, DSL.DEMAND_SUB_ID, DSL.DEMAND_SEQ_NO, DSL.DEMAND_NO,
                        ISNULL((CONVERT(NVARCHAR(MAX),CONVERT(VARBINARY(8000), RB.BITS ))),'') AS [SPECS], EMP.FIRST_NAME AS [BUYER_NAME], EMP.EMAIL_ADDR, 
                        CONVERT(VARCHAR, GETDATE(), 100) AS [START_TIME], VENDOR.NAME,
                        SYSTEM_USER AS [REC_USER_ID], (SELECT TOP 1 FIRST_NAME FROM EMPLOYEE WHERE USER_ID = SYSTEM_USER) AS [REC_USER_NAME]
                        FROM PURCHASE_ORDER PO
                        LEFT JOIN PURC_ORDER_LINE POL ON POL.PURC_ORDER_ID = PO.ID
                        LEFT JOIN DEMAND_SUPPLY_LINK DSL ON DSL.SUPPLY_TYPE = 'PO' AND SUPPLY_BASE_ID = PO.ID AND SUPPLY_SEQ_NO = POL.LINE_NO
                        LEFT JOIN REQUIREMENT_BINARY RB ON RB.WORKORDER_TYPE = 'W' AND RB.WORKORDER_BASE_ID = DSL.DEMAND_BASE_ID AND RB.WORKORDER_LOT_ID = DSL.DEMAND_LOT_ID
                            AND RB.WORKORDER_SPLIT_ID = DSL.DEMAND_SPLIT_ID AND RB.WORKORDER_SUB_ID = DSL.DEMAND_SUB_ID AND RB.OPERATION_SEQ_NO = DSL.DEMAND_SEQ_NO AND RB.PIECE_NO = DSL.DEMAND_NO
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = PO.BUYER
                        LEFT JOIN VENDOR ON VENDOR.ID = PO.VENDOR_ID
                        WHERE PO.ID = '{}'""".format(unique_id))
        # Convert data to dictionary
        data = [dict(zip([column[0] for column in sql.description], row)) for row in sql.fetchall()]
        cnxn.close()

        # Join some columns to create a new column
        for i in range(len(data)):
            data[i]['ITEM'] = data[i]['DEMAND_BASE_ID'] + ' - ' + str(data[i]['DEMAND_LOT_ID']) + ' - ' + str(data[i]['DEMAND_SPLIT_ID']) + ' - ' + str(data[i]['DEMAND_SUB_ID']) +  ' - ' + str(data[i]['DEMAND_NO']) + ' : ' + data[i]['SPECS']

        # If data length is greater than 1, then we have multiple items
        if len(data) > 1:
            items = ''
            for i in range(len(data)):
                items += data[i]['ITEM'] + '<br>'
            data[0]['ITEM'] = items
        html = purchase_order_notification_template.format(
            EMPLOYEE_NAME = data[0]['BUYER_NAME'],
            PO_NUMBER = data[0]['ID'],
            VENDOR = data[0]['NAME'],
            REC_NAME = data[0]['REC_USER_ID'],
            REC_EMP_ID = data[0]['REC_USER_NAME'],
            START_TIME = data[0]['START_TIME'],
            ITEMS = data[0]['ITEM'],

            FOLDER_PATH = configData['u_drive_path'] +  "\\Documents" + '\\',
            url = url_ticket
        )
        subject = """{PO_NUMBER}, {EMPLOYEE_NAME} - Received PO Notification""".format(PO_NUMBER = data[0]['ID'], EMPLOYEE_NAME = data[0]['BUYER_NAME'])
        
        return html, subject


def send_email(type, email, connection_string, unique_id, notes):
    try:
        if type == 'labor_ticket_start':
            html_subject = generate_email_template('labor_ticket_start', unique_id, connection_string)
        if type == 'qa_email_added':
            html_subject = generate_email_template('qa_email_added', unique_id, connection_string)
        if type == 'purchase_order_notification':
            html_subject = generate_email_template('purchase_order_notification', unique_id, connection_string)

        msg = MIMEMultipart()
        msg['From'] = configData['smtp_user']
        msg['To'] = email
        msg['Subject'] = html_subject[1]
        msg.attach(MIMEText(html_subject[0], 'html'))

        server = smtplib.SMTP(configData['smtp_host'], configData['smtp_port'])
        server.starttls()
        server.login(configData['smtp_user'], configData['smtp_password'])
        text = msg.as_string()
        server.sendmail(configData['smtp_user'], email, text)
        server.quit()

        # Insert into uni notifications table
        cnxn = pyodbc.connect(connection_string)
        sql = cnxn.cursor()
        sql.execute(details_query['INSERT_INTO_UNI_NOTIFICATION'].format(
            UNIQUE_ID = unique_id, 
            RECIPIENTS = email, 
            TYPE = type, 
            TEMPLATE = type,
            NOTES = notes
            ))
        cnxn.commit()
        sql.close()
        return True

    except Exception as e:
        print(str(e))
        return False
    

def save_base64_to_image(base, file_name):
    image = base64.b64decode(base, validate=True)
    with open(file_name, "wb") as f:
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
