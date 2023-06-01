# *****************************************************************************************
#  This is used for inital upload to the database. The output of this script is 1 file. 
#  Upload Imp to the IMP_FIELDS table.
#  
# *****************************************************************************************


import pandas as pd
import numpy as np
import json
from datetime import datetime
from sqlalchemy import create_engine
import mysql.connector

with open('columns.json', 'r') as JSON:
    column_dict = json.load(JSON)


def upload_parcels(filepath, engine):
    df = pd.read_excel(filepath)

    # Rename the columns to match the database
    df = df.rename(columns=column_dict)

    impColumns = ['TSRID', 'ORIGINAL_LIEN_AMOUNT', 'ORIGINAL_LIEN_INTEREST', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 
            'ORIGINAL_LIEN_INTERVAL', 'PREMIUM_AMOUNT', 'PREMIUM_INTEREST', 'PREMIUM_EFFECTIVE_DATE']


    df = df[df['TSRID'].isnull() == False]
    df['UNIQUE_ID'] = df['TSRID']

    # Check for null values in required columns
    for i in impColumns:
        if df[i].isnull().sum() > 0:
            return ('There were null values in column: ',i, df[i].isnull().sum())

    # Convert the date columns to datetime format
    data_type_cols = ['INVESTMENT_DATE', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 'PREMIUM_EFFECTIVE_DATE', 'LATEST_SALE_DATE', 'LATEST_ARMS_LENGTH_SALE_DATE', 'PRIOR_ARMS_LENGTH_SALE_DATE', 'LOAN1_DUE_DATE']
    for i in data_type_cols:
        df[i] = pd.to_datetime(df[i], errors='coerce')
        df[i] = df[i].dt.strftime('%Y-%m-%d')

    # Remove extra spaces from the data
    df['MANAGING_COMPANY'] = df['MANAGING_COMPANY'].str.replace('  ', '')
    df['LEGAL_BRIEF_DESC'] = df['LEGAL_BRIEF_DESC'].str.replace('  ', '')


    # ********************** Uploading data here ********************************
    try:
        df.to_sql('PARCELS', engine, if_exists='append', index=False)
        return ('Data uploaded successfully')
    except Exception as e:
        return ('Error while uploading data to the database: ', e)
    # ********************** Uploading data here ********************************

def update_parcels(filepath, configData):
    columns = ['MANAGING_COMPANY', 'CERTIFICATE', 'INVESTMENT_DATE', 'ORIGINAL_LIEN_AMOUNT', 'ORIGINAL_LIEN_INTEREST', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 
            'ORIGINAL_LIEN_INTERVAL', 'PREMIUM_AMOUNT', 'PREMIUM_INTEREST', 'PREMIUM_EFFECTIVE_DATE', 'PREMIUM_INTERVAL', 'TSRID', 'STATE', 'COUNTY', 
            'MUNICIPALITY', 'PARCEL_ID', 'TAX_ID', 'OWNER_NAME_CURRENT_OWNER', 'OWNER_ADDRESS', 'OWNER_CITY_STATE_ZIP', 'HOMESTEAD_EXEMPTION', 
            'TOTAL_ASSESSED_VALUE', 'TOTAL_MARKET_VALUE', 'APN', 'LOCATION_FULL_STREET_ADDRESS', 'LOCATION_CITY', 'LOCATION_ZIP', 'LONGITUDE', 
            'LATITUDE', 'OWNER_OCCUPIED', 'COUNTY_LAND_USE', 'COUNTY_LAND_USE_DESC', 'STANDARDIZED_LAND_USE', 'STANDARDIZED_LAND_USE_DESC_PROPERTY_TYPE', 
            'LOT_SIZE', 'LOT_SIZE_UNIT', 'ZONING', 'BUILDING_CLASS', 'YEAR_BUILT', 'NO_OF_STORIES', 'NO_OF_UNITS', 'ASSESSMENT_YEAR', 'LATEST_SALE_DATE', 
            'LATEST_SALE_PRICE', 'LATEST_ARMS_LENGTH_SALE_DATE', 'LATEST_ARMS_LENGTH_SALE_PRICE', 'PRIOR_ARMS_LENGTH_SALE_DATE', 'PRIOR_ARMS_LENGTH_SALE_PRICE', 
            'LOAN1_AMOUNT', 'LOAN1_DUE_DATE', 'LOAN1_TYPE', 'LOAN2_AMOUNT', 'LEGAL_CITY', 'LEGAL_BLOCK', 'LEGAL_LOT_NUMBER', 'QUALIFIER', 'LEGAL_SECTION', 'LEGAL_UNIT', 
            'LEGAL_SUBDIVISION_NAME', 'LEGAL_TRACT_NUMBER', 'LEGAL_SECTION_TOWNSHIP_RANGE_MERIDIAN', 'LEGAL_BRIEF_DESC', 'SUBJECT_FOUND_COUNT', 'ENV_RISK', 
            'TAG_KEEP_MAYBE_REMOVE_VIEWED', 'GRADE_A_B_C_D_F', 'GROUP_1_2_3_4_5', 'NOTES']
    
    try:
        mydb = mysql.connector.connect(
            host = configData['host'],
            user = configData['user'],
            password = configData['password'],
            database = configData['database']
        )
        mycursor = mydb.cursor()
    except mysql.connector.Error as err:
        return ('Error while connecting to the database: ', err)

    df = pd.read_excel(filepath)

    # Drop the columns that are not required
    df = df.drop(columns=[col for col in df if col not in columns])

    if 'TSRID' not in df.columns:
        return ('TSRID column not found in the file!') 

    df = df[df['TSRID'].isnull() == False]
    
    if len(df) == 0:
        return ('No data found in the file!') 

    UPDATE_QUERY = "UPDATE PARCELS SET {COL} = '{VALUE}' WHERE TSRID = '{TSRID}';"
    UPDATE_QUERY_COMPLETE_STRING = ['SET SQL_SAFE_UPDATES = 0;']
    df = df.replace(np.nan, '', regex=True)
    df = df.replace('nan', '', regex=True)
    df = df.replace('  ', ' ', regex=True)
    df = df.replace('None', '', regex=True)
    df = df.replace('none', '', regex=True)


    for index, row in df.iterrows():
        for col in df.columns:
            if col != 'TSRID':
                if row[col] is None or row[col] == '' or row[col] == ' ' or row[col] == np.nan or row[col] == 'nan':
                    pass
                else:
                    update_query = UPDATE_QUERY.format(COL=col, VALUE=row[col], TSRID=row['TSRID'])
                    UPDATE_QUERY_COMPLETE_STRING.append(update_query)

    # UPDATE_QUERY_COMPLETE_STRING = "\n".join(UPDATE_QUERY_COMPLETE_STRING)
    for i in UPDATE_QUERY_COMPLETE_STRING:
       
        try:
            mycursor.execute(i)
            mydb.commit()
        except:
            mycursor.close()
            return ('Error while updating the data!')
    
    mycursor.close()     
    return ('Data updated successfully!')

def upload_subs(filepath, engine):
    df = pd.read_excel(filepath)
    # Rename the columns to match the database
    df = df.rename(columns=column_dict)

    # Check if null values in the dataframe
    if (df.isnull().values.any() > 0):
        return ('Null values found in the file!')

    # Remove row with null values
    df = df[df['UNIQUE_ID'].isnull() == False]
    df = df[df['AMOUNT'].isnull() == False]
    df = df[df['EFFECTIVE_DATE'].isnull() == False]
    df = df[df['INTEREST'].isnull() == False]
    df = df[df['INTEREST_ACC_INTERVAL'].isnull() == False]

    data_type_cols = ['EFFECTIVE_DATE']
    for i in data_type_cols:
        df[i] = pd.to_datetime(df[i], errors='coerce')
        df[i] = df[i].dt.strftime('%Y-%m-%d')

    # Change column to lowercase
    df['INTEREST_ACC_INTERVAL'] = df['INTEREST_ACC_INTERVAL'].str.lower()

    # Filter dataframe on the basis of the columns
    df = df[ (df['INTEREST_ACC_INTERVAL'] == 'per_diem') | (df['INTEREST_ACC_INTERVAL'] == 'monthly') ]

    df = df[ df['INTEREST'] <= 1  ]

    # Add Category column
    df['CATEGORY'] = 3

    print (type(df))

    try:
        df.to_sql('FEES', engine, if_exists='append', index=False)
        return ('Subs uploaded successfully')
    except Exception as e:
        return ('Error while uploading data to the database: ', e)


