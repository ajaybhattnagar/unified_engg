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


with open ('config.json') as f:
    configData = json.load(f)

engine = create_engine(configData['engine_url'])


def connect_database(user):
    try:
        mydb = mysql.connector.connect(
            host = configData['host'],
            user = user,
            password = configData['db_user_password'],
            database = configData['database']
        )
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    return mydb

# ************************************************************************************************
# Specify the part of the file here. Make sure you this "\\" twice

filePath = "E:\\Bob - SDA\\API\\sample.xlsx"

# ************************************************************************************************

df = pd.read_excel(filePath)

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

impColumns = ['TSRID', 'ORIGINAL_LIEN_AMOUNT', 'ORIGINAL_LIEN_INTEREST', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 
           'ORIGINAL_LIEN_INTERVAL', 'PREMIUM_AMOUNT', 'PREMIUM_INTEREST']


df = df[df['TSRID'].isnull() == False]
df['UNIQUE_ID'] = np.random.randint(0,999999999, size=len(df))

# Convert the date columns to datetime format
data_type_cols = ['INVESTMENT_DATE', 'ORIGINAL_LIEN_EFFECTIVE_DATE', 'PREMIUM_EFFECTIVE_DATE', 'LATEST_SALE_DATE', 'LATEST_ARMS_LENGTH_SALE_DATE', 'PRIOR_ARMS_LENGTH_SALE_DATE', 'LOAN1_DUE_DATE']
for i in data_type_cols:
    df[i] = pd.to_datetime(df[i], errors='coerce')
    df[i] = df[i].dt.strftime('%Y-%m-%d')

# Remove extra spaces from the data
df['MANAGING_COMPANY'] = df['MANAGING_COMPANY'].str.replace('  ', '')
df['LEGAL_BRIEF_DESC'] = df['LEGAL_BRIEF_DESC'].str.replace('  ', '')


# ********************** Uploading data here ********************************
df.to_sql('PARCELS', engine, if_exists='append', index=False)
# ********************** Uploading data here ********************************
