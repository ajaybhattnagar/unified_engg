parcel_query = {

"SEARCH_PARCEL": """SELECT *,
                    (SELECT SUM(AMOUNT) FROM FEES WHERE CATEGORY = 1 AND UNIQUE_ID = PARCELS.UNIQUE_ID) 'BEGINNING_BALANCE',
                    (SELECT MIN(CHECK_RECEIVED) FROM REDEEM WHERE UNIQUE_ID = PARCELS.UNIQUE_ID) 'FIRST_CHECK_DATE'
                    FROM PARCELS 
                    WHERE TSRID LIKE '{TEXT}' OR STATE LIKE '{TEXT}' OR MUNICIPALITY LIKE '{TEXT}' 
                    OR LOCATION_FULL_STREET_ADDRESS LIKE '{TEXT}' OR UNIQUE_ID LIKE '{TEXT}' OR PARCEL_ID LIKE '{TEXT}' 
                    LIMIT 1000
                    """,

"GET_PARCELS_BASED_ON_FILTERS": """SELECT * 
                    FROM PARCELS 
                    WHERE STATE LIKE '{STATE}' {COUNTY} {MUNICIPALITY} {STATUS} """,


"GET_DISTINCT_STATES": """SELECT DISTINCT STATE FROM PARCELS""",
"GET_DISTINCT_COUNTY": """SELECT DISTINCT COUNTY FROM PARCELS""",
"GET_DISTINCT_MUNICIPALITY": """SELECT DISTINCT REPLACE(MUNICIPALITY, '  ','') 'MUNICIPALITY' FROM PARCELS""",

"GET_PARCEL_BY_ID": """SELECT * FROM PARCELS WHERE UNIQUE_ID = '{ID}'""",

"GET_PARCEL_FEES_BY_ID": """
                            WITH ALL_FEES AS (
                            SELECT ID, UNIQUE_ID, CATEGORY, DESCRIPTION, AMOUNT, INTEREST, INTEREST_ACC_INTERVAL, EFFECTIVE_DATE, EFFECTIVE_END_DATE 
                            FROM FEES 
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = '1'
                            ORDER BY EFFECTIVE_DATE ASC)

                            SELECT * FROM ALL_FEES
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
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = '1'
                            """,

"UPDATE_STATUS_BY_ID": """UPDATE PARCELS SET STATUS = '{STATUS}' WHERE UNIQUE_ID = '{ID}'""",

"UPDATE_FEES_BY_ID": """UPDATE FEES
                    SET CATEGORY = '{CATEGORY}', DESCRIPTION = '{DESCRIPTION}', AMOUNT = '{AMOUNT}', INTEREST_ACC_INTERVAL = 'per_diem',
                    INTEREST = '{INTEREST}', EFFECTIVE_DATE = '{EFFECTIVE_DATE}', EFFECTIVE_END_DATE = '{EFFECTIVE_END_DATE}'
                    WHERE ID = '{ID}'""",

"DELETE_FEES_BY_ID": """UPDATE FEES SET IS_ACTIVE = '0' WHERE ID = {ID};""",

"INSERT_FEES_BY_UNIQUE_ID": """
                        INSERT INTO FEES
                        (`UNIQUE_ID`, `CATEGORY`, `DESCRIPTION` , `AMOUNT`, `INTEREST`, `INTEREST_ACC_INTERVAL`, `EFFECTIVE_DATE` )
                        VALUES
                        ( '{UNIQUE_ID}', '{CATEGORY}', '{DESCRIPTION}' ,'{AMOUNT}', '{INTEREST}', 'per_diem', '{EFFECTIVE_DATE}');""",


"GET_PARCEL_FEES_BY_ID_PAYOFF_REPORT": """
                    SELECT ID, UNIQUE_ID, CATEGORY, DESCRIPTION, AMOUNT, INTEREST, INTEREST_ACC_INTERVAL, CONVERT(EFFECTIVE_DATE, DATE) 'EFFECTIVE_DATE',  
                    AMOUNT,
                    -- CASE 
                       -- WHEN CATEGORY > 2 THEN AMOUNT
                        -- WHEN CATEGORY < 3 THEN 0
                    -- ELSE 0 END AS 'AMOUNT',
                    CASE 
                        WHEN CATEGORY <= 3 THEN 0
                        WHEN CATEGORY = 9 THEN 0
                        WHEN CATEGORY IN (4,5,6,7,8,10) THEN 0
                    ELSE 0 END AS 'FEES',
                    CASE
                        WHEN CONVERT(EFFECTIVE_END_DATE, DATE) > '1994-10-21' THEN CONVERT(EFFECTIVE_END_DATE, DATE)
                        WHEN CONVERT(EFFECTIVE_END_DATE, DATE) = '0000-00-00' THEN STR_TO_DATE('{END_DATE}', '%Y-%m-%d') 
                        ELSE STR_TO_DATE('{END_DATE}', '%Y-%m-%d') 
                    END AS 'EFFECTIVE_END_DATE',
                    (SELECT AMOUNT FROM FEES F1 WHERE F1.CATEGORY = 1 AND F1.IS_ACTIVE = '1' AND F1.UNIQUE_ID = FEES.UNIQUE_ID) 'BEGINNING_BALANCE',
                    (SELECT AMOUNT FROM FEES F1 WHERE F1.CATEGORY = 2 AND F1.IS_ACTIVE = '1' AND F1.UNIQUE_ID = FEES.UNIQUE_ID) 'PREMIUM',
                    (SELECT STATE FROM PARCELS WHERE UNIQUE_ID = FEES.UNIQUE_ID) AS 'STATE'
                    FROM FEES 
                    WHERE FEES.UNIQUE_ID = '{ID}' AND FEES.IS_ACTIVE = '1'
                    -- ORDER BY EFFECTIVE_DATE

                    UNION

                    SELECT 99999 'ID', UNIQUE_ID, 107 'CATEGORY', 'Year End Penalty' AS 'DESCRIPTION', 0 'AMOUNT', 0 'INTERST', NULL 'INTEREST_ACC_INTERVAL',
                    NULL 'EFFECTIVE_DATE', 0 'AMOUNT', YEAR_END_PENALTY AS 'FEES', NULL 'EFFECTIVE_END_DATE', NULL 'BEGINNING_BALANCE', 0 'PREMIUM',
                    PARCELS.STATE
                    FROM PARCELS WHERE UNIQUE_ID = '{ID}'
                    """,

"GET_PAYMENTS_SUM_BY_ID": """SELECT IFNULL(SUM(CHECK_AMOUNT),0) 'PAYMENTS' FROM REDEEM WHERE UNIQUE_ID = '{ID}'""",

"GET_PAYMENT_DETAILS_BY_ID": """SELECT * FROM REDEEM WHERE UNIQUE_ID = '{ID}'""",

"DELETE_PAYMENT_BY_ID": """DELETE FROM REDEEM WHERE ID = {ID}""",

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

"UPDATE_FEES_DATE_BY_ID": """UPDATE FEES SET EFFECTIVE_END_DATE = '{EFFECTIVE_END_DATE}' WHERE UNIQUE_ID = '{ID}' """,

"UPDATE_PARCEL_YEP_BY_ID": """UPDATE PARCELS SET YEAR_END_PENALTY = '{YEP}' WHERE UNIQUE_ID = '{ID}' """,
}