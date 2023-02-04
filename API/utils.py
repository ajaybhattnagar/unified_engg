import mysql.connector
import pandas as pd
import numpy as np
import json


from queries.db_query import db_query


with open ('config.json') as f:
    configData = json.load(f)

def open_db_connection():
    try:
        mydb = mysql.connector.connect(
            host = configData['host'],
            user = configData['user'],
            password = configData['password'],
            database = configData['database']
        )
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    return mydb


# Check if user exists
def check_user(email):
    myresult = pd.DataFrame()
    mydb = open_db_connection()
    mycursor = mydb.cursor()
    mycursor.execute(db_query['USER_CHECK'].format(EMAIL=email.lower()))
    myresult = mycursor.fetchall()
    myresult = pd.DataFrame(myresult, columns=['COUNT'])
    myresult = myresult['COUNT'].values[0]
    mycursor.close()
    mydb.close()
    if myresult > 0:
        return 1
    else:
        return 0


# Get user details
def get_user_details(email):
    mydb = open_db_connection()
    mycursor = mydb.cursor()
    mycursor.execute(db_query['USER_DETAILS'].format(EMAIL=email))
    myresult = mycursor.fetchall()
    myresult = pd.DataFrame(myresult, columns=["ID", "CREATE_DATE", "LAST_MODIFY_DATE", "EMAIL", "PASSWORD", "IS_ACTIVE"])
    mycursor.close()
    mydb.close()
    return myresult

    mydb = open_db_connection()
    mycursor = mydb.cursor()
    mycursor.execute(db_query['UPDATE_ACTIVITY_RECORD'].format(
        ID=data['ID'][0], 
        FIELD_1=data['FIELD_1'][0], 
        FIELD_2=data['FIELD_2'][0], 
        FIELD_3=data['FIELD_3'][0]
    ))
    mydb.commit()
    mycursor.close()
    mydb.close()
    return 1