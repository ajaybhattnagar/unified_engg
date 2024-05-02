user_query = {
    
    "ADD_USER_IF_NOT_EXIST": """IF NOT EXISTS (SELECT * FROM [UNI_USERS] WHERE ID = '{EMP_ID}')
                                BEGIN 
                                INSERT INTO UNI_USERS ([ID]) VALUES ('{EMP_ID}')
                                END""",
                                
    "GET_USER_DETAILS": """SELECT * FROM [UNI_USERS] WHERE ID = '{EMP_ID}'""",

    "GET_ALL_USERS": """SELECT UNI.ROWID, UNI.CREATE_DATE, EMP.FIRST_NAME, EMP.LAST_NAME, UNI.ID, UNI.ADMIN, UNI.SUPER_ADMIN, UNI.ALLOWED_WORKING_TIME, UNI.ALLOWED_WORKING_LOCATION, UNI.ALLOWED_SET_QA_NOTIFICATION,
                        UNI.ALLOWED_RECEIPT_ENTRY, UNI.ALLOWED_EDIT_LABOR_TICKET, UNI.ALLOWED_DUPLICATE_RECORD, UNI.ALLOWED_APPROVE_PAGE, UNI.ALLOWED_CREATE_QUOTE,
                        UNI.ALLOWED_BACKDATE_LABOR_TICKET
                        FROM UNI_USERS UNI
                        LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = UNI.ID""",

    "UPDATE_USERS": """UPDATE [dbo].[UNI_USERS]
                        SET [FIRST_NAME] = '{FIRST_NAME}'
                            ,[LAST_NAME] = '{LAST_NAME}'
                            ,[ADMIN] = {ADMIN}
                            ,[SUPER_ADMIN] = {SUPER_ADMIN}
                            ,[ALLOWED_WORKING_LOCATION] = {ALLOWED_WORKING_LOCATION}
                            ,[ALLOWED_WORKING_TIME] = {ALLOWED_WORKING_TIME}
                            ,[ALLOWED_APPROVE_PAGE] = {ALLOWED_APPROVE_PAGE}
                            ,[ALLOWED_EDIT_LABOR_TICKET] = {ALLOWED_EDIT_LABOR_TICKET}
                            ,[ALLOWED_SET_QA_NOTIFICATION] = {ALLOWED_SET_QA_NOTIFICATION}
                            ,[ALLOWED_RECEIPT_ENTRY] = {ALLOWED_RECEIPT_ENTRY}
                            ,[ALLOWED_DUPLICATE_RECORD] = {ALLOWED_DUPLICATE_RECORD}
                            ,[ALLOWED_CREATE_QUOTE] = {ALLOWED_CREATE_QUOTE}
                            ,[ALLOWED_BACKDATE_LABOR_TICKET] = {ALLOWED_BACKDATE_LABOR_TICKET}
                        WHERE ROWID = {ROWID}
                        """

    
    
}