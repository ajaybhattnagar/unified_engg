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
    PARCELS.*
    FROM FEES
    LEFT JOIN PARCELS ON PARCELS.UNIQUE_ID = FEES.UNIQUE_ID
    WHERE FEES.IS_ACTIVE = '1' AND PARCELS.UNIQUE_ID IS NOT NULL -- AND FEES.UNIQUE_ID = '13337263'
    """,

    "FEE_DETAIL_REPORT": """
    SELECT PARCELS.STATUS, PARCELS.STATE, PARCELS.COUNTY, PARCELS.MUNICIPALITY, PARCELS.UNIQUE_ID, PARCELS.PARCEL_ID, PARCELS.CERTIFICATE,
    FEES.ID, FEES.CATEGORY, FEES.DESCRIPTION, 
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

}