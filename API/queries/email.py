email_query = {
    "GET_QUOTES_DETAILS": """
                        SELECT Q.ID, Q.CUSTOMER_ID, Q.NAME, Q.USER_ID, CONVERT(VARCHAR, Q.CREATE_DATE, 107) AS [CREATE_DATE], Q.SALESREP_ID, 
                        EMP.FIRST_NAME, EMP.EMAIL_ADDR, 
                        (SELECT TOP 1 DESCRIPTION FROM QUOTE_LINE WHERE QUOTE_ID = Q.ID) AS [DESCRIPTION]
                        FROM QUOTE Q
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = Q.USER_ID
                        WHERE Q.ID = '{QUOTE_ID}'""",

    "GET_PO_DETAILS": """SELECT PO.ID, PO.BUYER, CONVERT(VARCHAR, PO.CREATE_DATE, 107) AS [CREATE_DATE], PO.VENDOR_ID, V.NAME, 
                        CAST(PO.TOTAL_AMT_ORDERED AS DECIMAL(10,2)) AS [TOTAL_AMT_ORDERED], PO.CURRENCY_ID, EMP.EMAIL_ADDR, 
                        CASE WHEN PO.TOTAL_AMT_ORDERED > 5000 THEN 'The cost of this PO exceeds $5000.00.' ELSE '' END AS [PO_WARNING_LINE_1], 
                        CASE WHEN EMP.DEPARTMENT_ID = 'STUDENT' THEN 'This PO was created by a Student user.' ELSE '' END AS [PO_WARNING_LINE_2], 
                        DSL.SUPPLY_BASE_ID, WO.USER_3, EMP2.EMAIL_ADDR AS [JOB_CO_EMAIL]
                        FROM PURCHASE_ORDER PO
                        LEFT JOIN VENDOR V ON V.ID = PO.VENDOR_ID
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = PO.BUYER
                        LEFT JOIN DEMAND_SUPPLY_LINK DSL ON DSL.SUPPLY_TYPE = 'PO' AND SUPPLY_BASE_ID = PO.ID
                        LEFT JOIN WORK_ORDER WO ON WO.TYPE = 'W' AND WO.BASE_ID = DSL.DEMAND_BASE_ID AND WO.SUB_ID = 0
                        LEFT JOIN EMPLOYEE EMP2 ON EMP2.USER_ID = WO.USER_3
                        WHERE PO.ID = '{PO_ID}' """



}
