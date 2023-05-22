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
        WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
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
            WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
            ELSE 'ERROR' END AS 'STATUS',
        PARCELS.STATE, PARCELS.COUNTY, PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID, PARCELS.PARCEL_ID, PARCELS.CERTIFICATE,
        FEES.ID, FEES.CATEGORY, FEES.EFFECTIVE_END_DATE 'EFFECTIVE_END_DATE_DISPLAY',
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
            WHEN PARCELS.STATUS = 11 THEN 'Redemption Variance'
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
        END AS 'EFFECTIVE_END_DATE', 
        NULL 'CUSTODIAN REFERENCE NUMBER', NULL 'FEES: NON-REDEEMABLE',
        FEES.LAST_MODIFY_DATE 'LAST MODIFY DATE', PARCELS.ORIGINAL_LIEN_AMOUNT 'BEGINNING BALANCE'
        FROM FEES
        LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
        WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL -- and PARCELS.UNIQUE_ID = '873128aa'""",

    "SUB_REQUEST_FORM": """SELECT PARCELS.STATE, PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID 'REFERENCE ID', PARCELS.CERTIFICATE,
                            PARCELS.LEGAL_BLOCK 'LEGAL BLOCK', PARCELS.LEGAL_LOT_NUMBER 'LEGAL LOT NUMBER', PARCELS.QUALIFIER, PARCELS.APN, 
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
                            WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
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
                                                WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
                                            ELSE 'ERROR' END AS 'STATUS',
                                            PARCELS.STATE, PARCELS.MUNICIPALITY, PARCELS.COUNTY, PARCELS.COUNTY_LAND_USE_DESC,
                                            PARCELS.PARCEL_ID, PARCELS.CERTIFICATE, PARCELS.TOTAL_MARKET_VALUE, PARCELS.TOTAL_ASSESSED_VALUE, PARCELS.ORIGINAL_LIEN_AMOUNT, PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE,
                                            PARCELS.PREMIUM_AMOUNT,  NULL 'LIEN/MARKET VALUE', NULL 'REFUNDED',
                                            F_REFUNDS.AMOUNT 'REFUNDS',
                                            TOP_SUB.AMOUNT 'SUB 1 AMOUNT',
                                            0.00 'SUB 2 AMOUNT',
                                            O_FEES.AMOUNT 'OTHER FEES',
                                            RED_DATE.DATE_REDEEMED 'REDEMPTION DATE', RED.CHECK_AMOUNT 'REDEMPTION CHECK AMOUNT', RED.CHECK_RECEIVED 'REDEMPTION CHECK RECEIVED'

                                            FROM PARCELS
                                            LEFT JOIN REDEEM RED ON RED.UNIQUE_ID = PARCELS.UNIQUE_ID
                                            LEFT JOIN (SELECT UNIQUE_ID, MIN(EFFECTIVE_END_DATE) AS 'DATE_REDEEMED' FROM FEES GROUP BY UNIQUE_ID) RED_DATE ON RED_DATE.UNIQUE_ID = PARCELS.UNIQUE_ID

                                            LEFT JOIN (SELECT UNIQUE_ID, CATEGORY, SUM(AMOUNT) 'AMOUNT'
                                                        FROM FEES
                                                        WHERE CATEGORY = 9
                                                        GROUP BY UNIQUE_ID, CATEGORY) F_REFUNDS ON F_REFUNDS.UNIQUE_ID = PARCELS.UNIQUE_ID

                                            LEFT JOIN (SELECT UNIQUE_ID, SUM(AMOUNT) 'AMOUNT' FROM FEES 
                                                        WHERE CATEGORY = 3 GROUP BY UNIQUE_ID) TOP_SUB ON TOP_SUB.UNIQUE_ID = PARCELS.UNIQUE_ID

                                            LEFT JOIN (SELECT UNIQUE_ID, SUM(AMOUNT) 'AMOUNT' FROM FEES 
                                                        WHERE CATEGORY = 12 GROUP BY UNIQUE_ID) O_FEES ON O_FEES.UNIQUE_ID = PARCELS.UNIQUE_ID

                                            WHERE PARCELS.UNIQUE_ID IS NOT NULL -- AND PARCELS.UNIQUE_ID = '6ac71fbc';""",

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
                                                PARCELS.ORIGINAL_LIEN_AMOUNT, PARCELS.PREMIUM_AMOUNT, PAY.PAYMENTS, PARCELS.STATE

                                                FROM FEES
                                                LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
                                                LEFT JOIN (SELECT UNIQUE_ID, IFNULL(SUM(CHECK_AMOUNT),0) 'PAYMENTS' FROM REDEEM GROUP BY UNIQUE_ID) PAY ON PAY.UNIQUE_ID = FEES.UNIQUE_ID
                                                WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL -- AND PARCELS.UNIQUE_ID = '790ac625'""",

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
                                                WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
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
                                                END AS 'EFFECTIVE_END_DATE', IFNULL(PAY.PAYMENT, 0) AS 'PAYMENT'

                                                FROM FEES
                                                LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
                                                LEFT JOIN (SELECT UNIQUE_ID, SUM(CHECK_AMOUNT) AS 'PAYMENT' FROM REDEEM GROUP BY UNIQUE_ID) PAY ON PAY.UNIQUE_ID = FEES.UNIQUE_ID
                                                WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL -- and PARCELS.UNIQUE_ID in ('d3371af2', '501274b3')""",

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
                                        WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
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
                                                        WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
                                                        ELSE 'ERROR' END AS 'STATUS',
                                                    PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS', NULL 'ANNUAL TAXES', PARCELS.LEGAL_BLOCK 'LEGAL BLOCK', PARCELS.LEGAL_LOT_NUMBER 'LEGAL LOT NUMBER', NULL 'TAX COLLECTOR - EMAIL',
                                                    PARCELS.CERTIFICATE
                                                    FROM PARCELS
                                                    WHERE PARCELS.UNIQUE_ID IS NOT NULL""",

    "WSFS_NEW_LIEN_EXPORT_TEMPLATE": """SELECT PARCELS.UNIQUE_ID 'REFERENCE ID', PARCELS.CERTIFICATE, PARCELS.PARCEL_ID 'PARCEL', PARCELS.STATE, PARCELS.COUNTY, PARCELS.MUNICIPALITY, 
                                        PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS',
                                        PARCELS.LOCATION_CITY 'LOCATION CITY', PARCELS.LOCATION_ZIP 'ZIP CODE', PARCELS.OWNER_NAME_CURRENT_OWNER 'PROPERTY OWNER', 
                                        PARCELS.ORIGINAL_LIEN_AMOUNT + PARCELS.PREMIUM_AMOUNT 'WSFS TOTAL MARKET VALUE', PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE 'BEGINNING BALANCE EFFECTIVE DATE'
                                        FROM PARCELS
                                        WHERE PARCELS.UNIQUE_ID IS NOT NULL""",

    "REDEMPTION_REPORT": """SELECT DISTINCT 'REDEEMED' AS 'STATUS', NULL AS 'MANAGER PROPERTY STATUS', PARCELS.STATE, PARCELS.COUNTY, PARCELS.MUNICIPALITY, PARCELS.PARCEL_ID 'PARCEL',
                    PARCELS.CERTIFICATE, PARCELS.UNIQUE_ID,
                    PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE 'BEGINNING BALANCE EFFECTIVE DATE', (SELECT MIN(EFFECTIVE_END_DATE) FROM FEES WHERE UNIQUE_ID = REDEEM.UNIQUE_ID) 'REDEMPTION DATE',
                    REDEEM.DATE_REDEEMED 'REDEMPTION CHECK EFFECTIVE DATE', REDEEM.CHECK_RECEIVED 'REDEMPTION CHECK RECEIVED',
                    REDEEM.CHECK_AMOUNT 'REDEMPTION CHECK AMOUNT', REDEEM.CHECK_NUMBER 'REDEMPTION CHECK NUMBER', NULL AS 'PARCEL URL', 
                    PARCELS.ORIGINAL_LIEN_AMOUNT 'BEGINNING BALANCE', PARCELS.PREMIUM_AMOUNT 'PREMIUM', PARCELS.LEGAL_BLOCK 'LEGAL BLOCK', PARCELS.LEGAL_LOT_NUMBER 'LEGAL LOT NUMBER', NULL AS 'REDEMPTION REDEMPTION VARIANCE', 
                    PARCELS.TSRID, 
                    FB.AMOUNT AS 'SUB 1 AMOUNT', 
                    FB.EFFECTIVE_DATE AS 'SUB 1 EFFECTIVE DATE'
                    FROM REDEEM
                    LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = REDEEM.UNIQUE_ID
                    LEFT JOIN ( SELECT UNIQUE_ID, AMOUNT, EFFECTIVE_DATE
                                FROM FEES 
                                WHERE ID IN (SELECT MIN(ID) FROM FEES WHERE CATEGORY = 3 GROUP BY UNIQUE_ID)) FB ON FB.UNIQUE_ID = REDEEM.UNIQUE_ID 
                    -- WHERE REDEEM.UNIQUE_ID = '7ed48031'
                            """,
    
    "WSFS_LTVL_STATUS" : """SELECT PARCELS.COUNTY, PARCELS.STATE, PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID 'REFERENCE ID', PARCELS.ORIGINAL_LIEN_EFFECTIVE_DATE 'BEGINNING BALANCE EFFECTIVE DATE',
                            PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS', PARCELS.LOCATION_CITY, PARCELS.LOCATION_FULL_STREET_ADDRESS 'ADDRESS', PARCELS.LOCATION_ZIP 'ZIP CODE',
                            PARCELS.ORIGINAL_LIEN_AMOUNT 'BEGINNING BALANCE', NULL 'TOTAL REDEEMABLE', PARCELS.STATUS, 
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
                                WHEN PARCELS.STATUS = 10 THEN 'REDEEMED'
                            ELSE 'ERROR' END AS 'STATUS_S', NULL 'CUSTODIAN REFERENCE NUMBER',
                            NULL 'MANAGER PROPERTY STATUS', REDE.CHECK_RECEIVED 'REDEMPTION CHECK RECEIVED', REDE.DATE_REDEEMED 'REDEMPTION DATE',
                            SUBS.AMOUNT 'SUB 1 AMOUNT', PARCELS.ORIGINAL_LIEN_INTEREST 'PREMIUMS', PARCELS.CREATE_DATE 'ACTIVE', 
                            P_RED_DT.PARTIAL_RED_DT 'PARTIAL REDEMPTION', PEND_RED_DT.PEND_RED_DT 'PENDING REDEPTION', REFUND_DT.REFUND_DT 'REFUNDED', BANKRUP_DT.BANKRUP_DT 'BANKRUPTCY',
                            REDE.CHECK_RECEIVED 'REDEEMED'
                            FROM PARCELS 
                            LEFT JOIN (SELECT UNIQUE_ID, MIN(CHECK_RECEIVED) 'CHECK_RECEIVED', MIN(DATE_REDEEMED) 'DATE_REDEEMED'
                                        FROM REDEEM
                                        GROUP BY UNIQUE_ID) REDE ON REDE.UNIQUE_ID = PARCELS.UNIQUE_ID
                            LEFT JOIN (SELECT UNIQUE_ID, SUM(AMOUNT) 'AMOUNT'
                                        FROM FEES 
                                        WHERE CATEGORY = 3
                                        GROUP BY UNIQUE_ID) SUBS ON SUBS.UNIQUE_ID = PARCELS.UNIQUE_ID
                            LEFT JOIN (SELECT UNIQUE_ID, MIN(DONE_AT) 'PARTIAL_RED_DT'
                                        FROM AUDIT 
                                        WHERE NEW_VALUE = 9 AND COLUMN_NAME = 'PARCEL_STATUS' 
                                        GROUP BY UNIQUE_ID) P_RED_DT ON P_RED_DT.UNIQUE_ID = PARCELS.UNIQUE_ID
                            LEFT JOIN (SELECT UNIQUE_ID, MIN(DONE_AT) 'PEND_RED_DT'
                                        FROM AUDIT 
                                        WHERE NEW_VALUE = 3 AND COLUMN_NAME = 'PARCEL_STATUS' 
                                        GROUP BY UNIQUE_ID) PEND_RED_DT ON PEND_RED_DT.UNIQUE_ID = PARCELS.UNIQUE_ID
                            LEFT JOIN (SELECT UNIQUE_ID, MIN(DONE_AT) 'REFUND_DT'
                                        FROM AUDIT 
                                        WHERE NEW_VALUE = 4 AND COLUMN_NAME = 'PARCEL_STATUS' 
                                        GROUP BY UNIQUE_ID) REFUND_DT ON REFUND_DT.UNIQUE_ID = PARCELS.UNIQUE_ID
                            LEFT JOIN (SELECT UNIQUE_ID, MIN(DONE_AT) 'BANKRUP_DT'
                                        FROM AUDIT 
                                        WHERE NEW_VALUE = 6 AND COLUMN_NAME = 'PARCEL_STATUS' 
                                        GROUP BY UNIQUE_ID) BANKRUP_DT ON BANKRUP_DT.UNIQUE_ID = PARCELS.UNIQUE_ID
                                        
                            -- WHERE PARCELS.UNIQUE_ID = '66e1eb0e'
                            """


}

