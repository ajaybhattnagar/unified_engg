email_query = {
    "GET_QUOTES_DETAILS": """
                        SELECT Q.ID, Q.CUSTOMER_ID, Q.NAME, Q.USER_ID, CONVERT(VARCHAR, Q.CREATE_DATE, 107) AS [CREATE_DATE], Q.SALESREP_ID, 
                        EMP.FIRST_NAME, EMP.EMAIL_ADDR, 
                        (SELECT TOP 1 DESCRIPTION FROM QUOTE_LINE WHERE QUOTE_ID = Q.ID) AS [DESCRIPTION]
                        FROM QUOTE Q
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = Q.USER_ID
                        WHERE Q.ID = '{QUOTE_ID}'"""



}
