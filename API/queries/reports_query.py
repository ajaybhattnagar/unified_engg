reports_query = {
    "GET_ALL_FIELDS_REPORT": """
        SELECT FEES.ID, FEES.CATEGORY, FEES.DESCRIPTION, 
        CASE 
            WHEN FEES.CATEGORY > 2 THEN FEES.AMOUNT
            WHEN FEES.CATEGORY < 3 THEN 0
        ELSE 0 END AS 'AMOUNT',
        CASE 
            WHEN FEES.CATEGORY > 2 THEN 0
            WHEN FEES.CATEGORY < 3 THEN FEES.AMOUNT
        ELSE 0 END AS 'FEES',
        FEES.INTEREST, FEES.INTEREST_ACC_INTERVAL, CONVERT(FEES.EFFECTIVE_DATE, DATE) 'EFFECTIVE_DATE',
        CASE
            WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) > '1994-10-21' THEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE)
            WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) = '0000-00-00' THEN STR_TO_DATE(CURDATE(), '%Y-%m-%d')

            ELSE STR_TO_DATE(CURDATE(), '%Y-%m-%d')
        END AS 'EFFECTIVE_END_DATE',
        (SELECT F1.AMOUNT FROM FEES F1 WHERE F1.CATEGORY = 1 AND F1.IS_ACTIVE = '1' AND F1.UNIQUE_ID = FEES.UNIQUE_ID) 'BEGINNING_BALANCE',
        (SELECT F1.AMOUNT FROM FEES F1 WHERE F1.CATEGORY = 2 AND F1.IS_ACTIVE = '1' AND F1.UNIQUE_ID = FEES.UNIQUE_ID) 'PREMIUM',
        CASE 
        WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
        WHEN PARCELS.STATUS = 2 THEN 'PENDING'
        WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
        WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
        WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
        WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
        WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
        WHEN PARCELS.STATUS = 8 THEN 'REO'
        WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
        WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
        ELSE 'ERROR' END AS 'STATUS',
        PARCELS.*
        FROM FEES
        LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
        WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL -- AND FEES.UNIQUE_ID = '13337263'
    """,

    "FEE_DETAIL_REPORT": """
        SELECT 
        CASE 
            WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
            WHEN PARCELS.STATUS = 2 THEN 'PENDING'
            WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
            WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
            WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
            WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
            WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
            WHEN PARCELS.STATUS = 8 THEN 'REO'
            WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
            WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
            ELSE 'ERROR' END AS 'STATUS',
        PARCELS.STATE, PARCELS.COUNTY, PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID, PARCELS.PARCEL_ID, PARCELS.CERTIFICATE,
        FEES.ID, FEES.CATEGORY,
        CASE 
            WHEN FEES.CATEGORY = 1 THEN 'Beginning Balance'
            WHEN FEES.CATEGORY = 2 THEN 'Premium'
            WHEN FEES.CATEGORY = 3 THEN 'Subsequent Tax'
            WHEN FEES.CATEGORY = 4 THEN 'Attorney Fees'
            WHEN FEES.CATEGORY = 5 THEN 'Certificate Fees'
            WHEN FEES.CATEGORY = 6 THEN 'Filling Fees'
            WHEN FEES.CATEGORY = 7 THEN 'Processing Fees'
            WHEN FEES.CATEGORY = 8 THEN 'Recording Fees'
            WHEN FEES.CATEGORY = 9 THEN 'Refunds'
            WHEN FEES.CATEGORY = 10 THEN 'TDA Fees'
            ELSE 'ERROR' END AS 'CATEGORY_STRING', 
        FEES.DESCRIPTION, 
        CASE 
            WHEN FEES.CATEGORY > 2 THEN FEES.AMOUNT
            WHEN FEES.CATEGORY < 3 THEN 0
        ELSE 0 END AS 'AMOUNT',
        CASE 
            WHEN FEES.CATEGORY > 2 THEN 0
            WHEN FEES.CATEGORY < 3 THEN FEES.AMOUNT
        ELSE 0 END AS 'FEES',
        FEES.INTEREST, FEES.INTEREST_ACC_INTERVAL, CONVERT(FEES.EFFECTIVE_DATE, DATE) 'EFFECTIVE_DATE',
        CASE
            WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) > '1994-10-21' THEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE)
            WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) = '0000-00-00' THEN STR_TO_DATE(CURDATE(), '%Y-%m-%d')

            ELSE STR_TO_DATE(CURDATE(), '%Y-%m-%d')
        END AS 'EFFECTIVE_END_DATE'

        FROM FEES
        LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
        WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL""",

    "SUB_REQUEST_FORM": """SELECT PARCELS.STATE, PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID, PARCELS.CERTIFICATE,
                            PARCELS.LEGAL_BLOCK, PARCELS.LEGAL_LOT_NUMBER, PARCELS.QUALIFIER, PARCELS.APN, 
                            CASE 
                                WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
                                WHEN PARCELS.STATUS = 2 THEN 'PENDING'
                                WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
                                WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
                                WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
                                WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
                                WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
                                WHEN PARCELS.STATUS = 8 THEN 'REO'
                                WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
                                WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
                                ELSE 'ERROR' END AS 'STATUS'
                            FROM PARCELS
                            WHERE PARCELS.UNIQUE_ID IS NOT NULL""",
    
    "LIEN_DETAILS_WEEKLY_REPORT_HEADER": """SELECT PARCELS.UNIQUE_ID, 
        CASE 
            WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
            WHEN PARCELS.STATUS = 2 THEN 'PENDING'
            WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
            WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
            WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
            WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
            WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
            WHEN PARCELS.STATUS = 8 THEN 'REO'
            WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
            WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
            ELSE 'ERROR' END AS 'STATUS',
                                PARCELS.STATE, PARCELS.MUNICIPALITY, PARCELS.COUNTY, PARCELS.COUNTY_LAND_USE_DESC,
                                PARCELS.PARCEL_ID, PARCELS.CERTIFICATE, PARCELS.TOTAL_MARKET_VALUE, PARCELS.TOTAL_ASSESSED_VALUE, PARCELS.ORIGINAL_LIEN_AMOUNT, PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE,
                                PARCELS.PREMIUM_AMOUNT, 
                                (SELECT SUM(AMOUNT) FROM FEES WHERE CATEGORY = 9 AND UNIQUE_ID = PARCELS.UNIQUE_ID) 'REFUNDS', 
                                RED.DATE_REDEEMED, RED.CHECK_AMOUNT, RED.CHECK_RECEIVED

                                FROM PARCELS
                                LEFT JOIN (SELECT UNIQUE_ID, MIN(DATE_REDEEMED) 'DATE_REDEEMED', SUM(CHECK_AMOUNT) 'CHECK_AMOUNT', MIN(CHECK_RECEIVED) 'CHECK_RECEIVED'
                                            FROM REDEEM 
                                            GROUP BY UNIQUE_ID) RED ON RED.UNIQUE_ID = PARCELS.UNIQUE_ID
                                WHERE PARCELS.UNIQUE_ID IS NOT NULL -- and PARCELS.UNIQUE_ID = 'a566729d';""",

    # LEFT TO FIX WITH DATE AND COLUMNS FROM SDA
    "LIEN_DETAILS_WEEKLY_REPORT_ITEM_DETIALS": """SELECT FEES.UNIQUE_ID, FEES.ID, FEES.CATEGORY, 
                                CASE 
                                    WHEN FEES.CATEGORY > 2 THEN FEES.AMOUNT
                                    WHEN FEES.CATEGORY < 3 THEN 0
                                ELSE 0 END AS 'AMOUNT',
                                CASE 
                                    WHEN FEES.CATEGORY > 2 THEN 0
                                    WHEN FEES.CATEGORY < 3 THEN FEES.AMOUNT
                                ELSE 0 END AS 'FEES',
                                FEES.INTEREST, FEES.INTEREST_ACC_INTERVAL, CONVERT(FEES.EFFECTIVE_DATE, DATE) 'EFFECTIVE_DATE',
                                CASE
                                    WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) > '1994-10-21' THEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE)
                                    WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) = '0000-00-00' THEN STR_TO_DATE(CURDATE(), '%Y-%m-%d')

                                    ELSE STR_TO_DATE(CURDATE(), '%Y-%m-%d')
                                END AS 'EFFECTIVE_END_DATE',
                                (SELECT F1.AMOUNT FROM FEES F1 WHERE F1.CATEGORY = 1 AND F1.IS_ACTIVE = '1' AND F1.UNIQUE_ID = FEES.UNIQUE_ID) 'BEGINNING_BALANCE',
                                (SELECT F1.AMOUNT FROM FEES F1 WHERE F1.CATEGORY = 2 AND F1.IS_ACTIVE = '1' AND F1.UNIQUE_ID = FEES.UNIQUE_ID) 'PREMIUM',
                                (SELECT IFNULL(SUM(CHECK_AMOUNT),0) 'PAYMENTS' FROM REDEEM WHERE UNIQUE_ID = FEES.UNIQUE_ID) 'PAYMENTS'

                                FROM FEES
                                LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
                                WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL -- and PARCELS.UNIQUE_ID = 'b1fd772b'""",

    "NEW_PENDING_REDEMPTION_NOTICE_TO_WSFS": """SELECT 
                                                concat(PARCELS.COUNTY ,', ', PARCELS.STATE) 'COUNTY, STATE' ,PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID 'REFERENCE ID', 
                                                PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE 'BEGINNING BALANCE EFFECTIVE DATE', 
                                                PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS', PARCELS.LOCATION_CITY 'LOCATION CITY', PARCELS.LOCATION_ZIP 'ZIP CODE',
                                                PARCELS.LEGAL_BLOCK 'LEGAL BLOCK', PARCELS.LEGAL_LOT_NUMBER 'LEGAL LOT NUMBER', PARCELS.QUALIFIER, PARCELS.ORIGINAL_LIEN_AMOUNT 'BEGINNING BALANCE', 0.00 'TOTAL REDEEMABLE',
                                                CASE 
                                                WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
                                                WHEN PARCELS.STATUS = 2 THEN 'PENDING'
                                                WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
                                                WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
                                                WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
                                                WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
                                                WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
                                                WHEN PARCELS.STATUS = 8 THEN 'REO'
                                                WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
                                                WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
                                                ELSE 'ERROR' END AS 'STATUS',
                                                PARCELS.CERTIFICATE,
                                                FEES.ID, FEES.CATEGORY,
                                                CASE 
                                                    WHEN FEES.CATEGORY > 2 THEN FEES.AMOUNT
                                                    WHEN FEES.CATEGORY < 3 THEN 0
                                                ELSE 0 END AS 'AMOUNT',
                                                CASE 
                                                    WHEN FEES.CATEGORY > 2 THEN 0
                                                    WHEN FEES.CATEGORY < 3 THEN FEES.AMOUNT
                                                ELSE 0 END AS 'FEES',
                                                FEES.INTEREST, FEES.INTEREST_ACC_INTERVAL, CONVERT(FEES.EFFECTIVE_DATE, DATE) 'EFFECTIVE_DATE',
                                                CASE
                                                    WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) > '1994-10-21' THEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE)
                                                    WHEN CONVERT(FEES.EFFECTIVE_END_DATE, DATE) = '0000-00-00' THEN STR_TO_DATE(CURDATE(), '%Y-%m-%d')

                                                    ELSE STR_TO_DATE(CURDATE(), '%Y-%m-%d')
                                                END AS 'EFFECTIVE_END_DATE'

                                                FROM FEES
                                                LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
                                                WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL limit 100""",

    "WSFS_REDEMPTION_NOTIFICATION": """SELECT PARCELS.STATE, PARCELS.COUNTY, PARCELS.PARCEL_ID 'PARCEL', PARCELS.CERTIFICATE, PARCELS.UNIQUE_ID 'REFERENCE ID', 
                                        CASE 
                                        WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
                                        WHEN PARCELS.STATUS = 2 THEN 'PENDING'
                                        WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
                                        WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
                                        WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
                                        WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
                                        WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
                                        WHEN PARCELS.STATUS = 8 THEN 'REO'
                                        WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
                                        WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
                                        ELSE 'ERROR' END AS 'STATUS',
                                        NULL 'MANAGER PROPERTY STATUS',
                                        DATE_FORMAT(RED.DATE_REDEEMED, '%m/%d/%Y') 'REDEMPTION DATE',
                                        NULL 'VOUCHER REQD FOR REDEMPTION'
                                        FROM PARCELS
                                        LEFT JOIN (SELECT UNIQUE_ID, MIN(DATE_REDEEMED) 'DATE_REDEEMED', SUM(CHECK_AMOUNT) 'CHECK_AMOUNT', MIN(CHECK_RECEIVED) 'CHECK_RECEIVED'
                                        FROM REDEEM 
                                        GROUP BY UNIQUE_ID) RED ON RED.UNIQUE_ID = PARCELS.UNIQUE_ID
                                        WHERE PARCELS.UNIQUE_ID IS NOT NULL""",

    "MUNICIPALITY_SPECIFIC_QUERY_FOR_SUBS": """SELECT PARCELS.UNIQUE_ID 'REFERENCE ID', PARCELS.MUNICIPALITY, PARCELS.COUNTY, 
                                                    CASE 
                                                        WHEN PARCELS.STATUS = 1 THEN 'ACTIVE'
                                                        WHEN PARCELS.STATUS = 2 THEN 'PENDING'
                                                        WHEN PARCELS.STATUS = 3 THEN 'PENDING REDEMPTION'
                                                        WHEN PARCELS.STATUS = 4 THEN 'REFUNDED'
                                                        WHEN PARCELS.STATUS = 5 THEN 'FORECLOSURE'
                                                        WHEN PARCELS.STATUS = 6 THEN 'BANKRUPTCY'
                                                        WHEN PARCELS.STATUS = 7 THEN 'WRITE-OFF'
                                                        WHEN PARCELS.STATUS = 8 THEN 'REO'
                                                        WHEN PARCELS.STATUS = 9 THEN 'PARTIAL REDEMPTION'
                                                        WHEN PARCELS.STATUS = 10 THEN 'REDEEM'
                                                        ELSE 'ERROR' END AS 'STATUS',
                                                    PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS', NULL 'ANNUAL TAXES', PARCELS.LEGAL_BLOCK 'LEGAL BLOCK', PARCELS.LEGAL_LOT_NUMBER 'LEGAL LOT NUMBER', NULL 'TAX COLLECTOR - EMAIL',
                                                    PARCELS.CERTIFICATE
                                                    FROM PARCELS
                                                    WHERE PARCELS.UNIQUE_ID IS NOT NULL""",

    "WSFS_NEW_LIEN_EXPORT_TEMPLATE": """SELECT PARCELS.UNIQUE_ID 'REFERENCE ID', PARCELS.CERTIFICATE, PARCELS.PARCEL_ID 'PARCEL', PARCELS.STATE, PARCELS.COUNTY, PARCELS.MUNICIPALITY, 
                                        PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS',
                                        PARCELS.LOCATION_CITY 'LOCATION CITY', PARCELS.LOCATION_ZIP 'ZIP CODE', PARCELS.OWNER_NAME_CURRENT_OWNER 'PROPERTY OWNER', 
                                        PARCELS.TOTAL_MARKET_VALUE 'WSFS TOTAL MARKET VALUE', PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE 'BEGINNING BALANCE EFFECTIVE DATE'
                                        FROM PARCELS
                                        WHERE PARCELS.UNIQUE_ID IS NOT NULL"""



}