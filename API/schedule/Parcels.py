import mysql.connector
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
import warnings
warnings.filterwarnings('ignore')
import bcrypt
import logging
import json
from routes.Reports import calc_total_payoff_and_other_interest
logging.basicConfig(filename="shipping_picking.log", level=logging.INFO, format='%(asctime)s %(levelname)-8s %(message)s',  datefmt='%Y-%m-%d %H:%M:%S')

from queries.reports_query import reports_query

with open ('config.json') as f:
    configData = json.load(f)

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


def update_payoff_interest_accured():
    connection = connect_database('ajay.bhattnagar21@gmail.com')
    try:
        mycursor = connection.cursor()

        mycursor.execute(reports_query['LIEN_DETAILS_WEEKLY_REPORT_HEADER'])
        header_details = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        header_details = pd.DataFrame.from_dict(header_details)

        mycursor.execute(reports_query['LIEN_DETAILS_WEEKLY_REPORT_ITEM_DETIALS'])
        all_parcel_fees = [dict((mycursor.description[i][0], value) for i, value in enumerate(row)) for row in mycursor.fetchall()]
        all_parcel_fees = pd.DataFrame.from_dict(all_parcel_fees)

        # Get the unique parcel ids
        unique_parcel_ids = all_parcel_fees['UNIQUE_ID'].unique()

        # Save column names
        column_names = all_parcel_fees.columns.to_list()
        column_names.append('TOTAL_INTEREST')
        column_names.append('TOTAL_PENALTY')

        # dataframe to list of list
        all_parcel_fees = all_parcel_fees.values.tolist()

        final_results = []

        # Calc pay off and other interest
        final_results = calc_total_payoff_and_other_interest(unique_parcel_ids, all_parcel_fees)

        # Convert the list of list to dataframe
        final_results = pd.DataFrame(final_results, columns=column_names)
        
        final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']] = final_results[["AMOUNT", "INTEREST", 'TOTAL_INTEREST', 'FEES']].apply(pd.to_numeric)
        header_details['TOTAL_CHECK_AMT'] = header_details['TOTAL_CHECK_AMT'].apply(pd.to_numeric)
        final_results['TOTAL_AMOUNT'] = round(final_results['AMOUNT'] + final_results['TOTAL_INTEREST'] + final_results['FEES'] + final_results['TOTAL_PENALTY'], 2)
        # print (final_results)

        final_results = final_results[['UNIQUE_ID', 'TOTAL_INTEREST', 'TOTAL_PENALTY', 'TOTAL_AMOUNT']]

        final_results = final_results.groupby("UNIQUE_ID", as_index=False).agg(
            {"UNIQUE_ID": "min", "TOTAL_INTEREST": "sum", 'TOTAL_PENALTY': 'min', 'TOTAL_AMOUNT': 'sum'}
        )

        header_details = pd.merge(header_details, final_results, how='left')
        header_details = header_details[['UNIQUE_ID', 'STATUS', 'TOTAL_AMOUNT', 'TOTAL_INTEREST']]

        header_details.loc[header_details['STATUS'] == 'REFUNDED', 'TOTAL_INTEREST'] = 0
        header_details.loc[header_details['STATUS'] == 'REDEEMED', 'TOTAL_AMOUNT'] = 0

        query = """UPDATE PARCELS SET TOTAL_PAYOFF = '{AMOUNT}', INTEREST_ACCRUED_VALUE = '{INTEREST}' WHERE UNIQUE_ID = '{UNIQUE_ID}'; """
        final_update_query = []

        for i in np.arange(len(header_details)):
            string = query.format(AMOUNT = header_details.iloc[i]['TOTAL_AMOUNT'], INTEREST = header_details.iloc[i]['TOTAL_INTEREST'], UNIQUE_ID = header_details.iloc[i]['UNIQUE_ID'])
            final_update_query.append(string)

        # Execute the query for refund and redeemed parcels
        mycursor = connection.cursor()
        update_refunded_redeemed = mycursor.execute("UPDATE PARCELS SET TOTAL_PAYOFF = '0', INTEREST_ACCRUED_VALUE = '0' WHERE STATUS IN (4, 10);" )

        # Execute the query
        mycursor = connection.cursor()
        for i in np.arange(len(final_update_query)):
            mycursor.execute(final_update_query[i])
            connection.commit()

        
        mycursor.close()    
        print ("Payoff and interest accrued updated successfully")
        logging.info("Payoff and interest accrued updated successfully")

    except Exception as e:
        print("Something went wrong: {}".format(e))
        
