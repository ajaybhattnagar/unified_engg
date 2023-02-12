parcel_query = {

"SEARCH_PARCEL": """SELECT * 
                    FROM PARCELS 
                    WHERE TSRID LIKE '{TEXT}' OR STATE LIKE '{TEXT}' OR MUNICIPALITY LIKE '{TEXT}' 
                    OR LOCATION_FULL_STREET_ADDRESS LIKE '{TEXT}' OR UNIQUE_ID LIKE '{TEXT}' """,

"GET_PARCELS_BASED_ON_FILTERS": """SELECT * 
                    FROM PARCELS 
                    WHERE STATE LIKE '{STATE}' {COUNTY} {MUNICIPALITY} {STATUS} """,


"GET_DISTINCT_STATES": """SELECT DISTINCT STATE FROM PARCELS""",
"GET_DISTINCT_COUNTY": """SELECT DISTINCT COUNTY FROM PARCELS""",
"GET_DISTINCT_MUNICIPALITY": """SELECT DISTINCT MUNICIPALITY FROM PARCELS""",

"GET_PARCEL_BY_ID": """SELECT * FROM PARCELS WHERE UNIQUE_ID = '{ID}'""",

"GET_PARCEL_FEES_BY_ID": """
                            SELECT ID, UNIQUE_ID, CATEGORY, DESCRIPTION, AMOUNT, INTEREST, INTEREST_ACC_INTERVAL, EFFECTIVE_DATE, EFFECTIVE_END_DATE 
                            FROM FEES 
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = '1'
                            UNION
                            SELECT NULL AS ID, NULL AS UNIQUE_ID, 101 AS CATEGORY, NULL AS DESCRIPTION, SUM(AMOUNT), NULL AS INTEREST, NULL AS INTEREST_ACC_INTERVAL, NULL AS EFFECTIVE_DATE, 
                            NULL AS EFFECTIVE_END_DATE 
                            FROM FEES 
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = '1'
                            UNION
                            SELECT NULL AS ID, NULL AS UNIQUE_ID, 102 AS CATEGORY, NULL AS DESCRIPTION, 0 AS AMOUNT, NULL AS INTEREST, NULL AS INTEREST_ACC_INTERVAL, NULL AS EFFECTIVE_DATE, 
                            NULL AS EFFECTIVE_END_DATE 
                            FROM FEES 
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = '1'
                            UNION
                            SELECT NULL AS ID, NULL AS UNIQUE_ID, 106 AS CATEGORY, NULL AS DESCRIPTION, SUM(AMOUNT), NULL AS INTEREST, NULL AS INTEREST_ACC_INTERVAL, NULL AS EFFECTIVE_DATE, 
                            NULL AS EFFECTIVE_END_DATE 
                            FROM FEES 
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = '1'""",

"UPDATE_STATUS_BY_ID": """UPDATE PARCELS SET STATUS = '{STATUS}' WHERE UNIQUE_ID = '{ID}'""",

"UPDATE_FEES_BY_ID": """UPDATE FEES
                    SET CATEGORY = '{CATEGORY}', DESCRIPTION = '{DESCRIPTION}', AMOUNT = '{AMOUNT}', INTEREST_ACC_INTERVAL = 'per_diem',
                    INTEREST = '{INTEREST}', EFFECTIVE_DATE = '{EFFECTIVE_DATE}', EFFECTIVE_END_DATE = '{EFFECTIVE_END_DATE}'
                    WHERE ID = '{ID}'""",

"DELETE_FEES_BY_ID": """UPDATE FEES SET IS_ACTIVE = '0' WHERE ID = {ID};""",

"INSERT_FEES_BY_UNIQUE_ID": """
                        INSERT INTO FEES
                        (`UNIQUE_ID`, `CATEGORY`, `DESCRIPTION` , `AMOUNT`, `INTEREST`, `INTEREST_ACC_INTERVAL`, `EFFECTIVE_DATE`, `EFFECTIVE_END_DATE`)
                        VALUES
                        ( '{UNIQUE_ID}', '{CATEGORY}', '{DESCRIPTION}' ,'{AMOUNT}', '{INTEREST}', 'per_diem', '{EFFECTIVE_DATE}', '{EFFECTIVE_END_DATE}');""",


"GET_PARCEL_FEES_BY_ID_PAYOFF_REPORT": """
                    SELECT ID, UNIQUE_ID, CATEGORY, DESCRIPTION, AMOUNT, INTEREST, INTEREST_ACC_INTERVAL, CONVERT(EFFECTIVE_DATE, DATE) 'EFFECTIVE_DATE', CONVERT(EFFECTIVE_END_DATE, DATE) 'EFFECTIVE_END_DATE', 
                    (SELECT AMOUNT FROM FEES WHERE CATEGORY = 1 AND IS_ACTIVE = '1' AND UNIQUE_ID = '{ID}' ) 'BEGINNING_BALANCE',
                    (SELECT AMOUNT FROM FEES WHERE CATEGORY = 2 AND IS_ACTIVE = '1' AND UNIQUE_ID = '{ID}') 'PREMIUM',
                    (SELECT CHECK_AMOUNT FROM REDEEM WHERE UNIQUE_ID = '{ID}') 'PAYMENTS_RECIEVED'
                    FROM FEES 
                    WHERE FEES.UNIQUE_ID = '{ID}' AND FEES.IS_ACTIVE = '1'""",


"REDEEM_PARTIAL_REDEEM_PARCEL": """INSERT INTO REDEEM
                                    (
                                    `UNIQUE_ID`,
                                    `DATE_REDEEMED`,
                                    `CHECK_AMOUNT`,
                                    `CHECK_NUMBER`,
                                    `CHECK_RECEIVED`,
                                    `SOURCE`,
                                    `METHOD`,
                                    `DESCRIPTION`)
                                    VALUES
                                    (
                                    '{UNIQUE_ID}',
                                    '{DATE_REDEEMED}',
                                    '{CHECK_AMOUNT}',
                                    '{CHECK_NUMBER}',
                                    '{CHECK_RECEIVED}',
                                    '{SOURCE}',
                                    '{METHOD}',
                                    '{DESCRIPTION}');""",

"UPDATE_FEES_DATE_BY_ID_AFTER_REDEEM": """UPDATE FEES SET EFFECTIVE_END_DATE = '{DATE_REDEEMED}' WHERE UNIQUE_ID = '{ID}' """,

}