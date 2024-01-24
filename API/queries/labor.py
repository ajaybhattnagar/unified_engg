labor_query = {

"CREATE_START_LABOR_TICKET": """
                INSERT INTO UNI_LABOR_TICKET
                        ([TRANSACTION_DATE] ,[WORKORDER_TYPE] ,[WORKORDER_BASE_ID] ,[WORKORDER_LOT_ID], [WORKORDER_SPLIT_ID] ,[WORKORDER_SUB_ID] ,[OPERATION_SEQ_NO]
                        ,[TYPE] ,[TYPE_STRING],[EMPLOYEE_ID] ,[RESOURCE_ID] 
                        ,[CLOCK_IN] 
                        ,[DESCRIPTION]
                        ,[INDIRECT_CODE] ,[INDIRECT_ID]
                        ,[UDF1] ,[UDF2] ,[UDF3] ,[UDF4],
                        [WORK_LOCATION], [REGULAR_TIME], [OVER_TIME], [DOUBLE_TIME], [QA_NOTES]
                )
                    VALUES
                        (GETDATE(), 
                        '{WORKORDER_TYPE}', '{WORKORDER_ID}', '{WORKORDER_LOT_ID}', '{WORKORDER_SPLIT_ID}', '{WORKORDER_SUB_ID}', '{OPERATION_SEQ_NO}'
                        ,'{RUN_TYPE}', '{RUN_TYPE_STRING}', '{EMP_ID}', '{RESOURCE_ID}',
                        GETDATE(), 
                        '{DESCRIPTION}', 
                        '{INDIRECT_CODE}', '{INDIRECT_ID}',
                        '{UDF1}', '{UDF2}', '{UDF3}', '{UDF4}',
                        '{WORK_LOCATION}', '{REGULAR_TIME}', '{OVER_TIME}', '{DOUBLE_TIME}', '{QA_NOTES}'
                        );

                SELECT SCOPE_IDENTITY() as id;
""",


"STOP_LABOR_TICKET": """UPDATE UNI_LABOR_TICKET
                            SET [CLOCK_OUT] = GETDATE(), 
                                [HOURS_WORKED] = {HOURS_WORKED}
                            WHERE TRANSACTION_ID = '{TRANSACTION_ID}' """,

"GET_WORKORDER_OPERATION_DETAILS": """SELECT OP.SEQUENCE_NO AS [value], (OP.RESOURCE_ID + ' ' + LEFT(ISNULL((CONVERT(NVARCHAR(MAX),CONVERT(VARBINARY(8000), OPB.BITS ))),''),10)) AS [label]            
                                        FROM OPERATION OP
                                        LEFT JOIN WORK_ORDER WO ON WO.TYPE = OP.WORKORDER_TYPE AND WO.BASE_ID = OP.WORKORDER_BASE_ID AND WO.LOT_ID = OP.WORKORDER_LOT_ID AND WO.SPLIT_ID = OP.WORKORDER_SPLIT_ID AND WO.SUB_ID = OP.WORKORDER_SUB_ID
                                        LEFT JOIN OPERATION_BINARY OPB ON WO.TYPE = OPB.WORKORDER_TYPE AND WO.BASE_ID = OPB.WORKORDER_BASE_ID AND WO.LOT_ID = OPB.WORKORDER_LOT_ID AND WO.SPLIT_ID = OPB.WORKORDER_SPLIT_ID AND WO.SUB_ID = OPB.WORKORDER_SUB_ID
                                    WHERE OP.WORKORDER_TYPE = '{WORKORDER_TYPE}' AND OP.WORKORDER_BASE_ID = '{WORKORDER_ID}' AND OP.WORKORDER_LOT_ID = {WORKORDER_LOT_ID} AND OP.WORKORDER_SPLIT_ID = {WORKORDER_SPLIT_ID} AND OP.WORKORDER_SUB_ID = {WORKORDER_SUB_ID}""",

"GET_TIMESTAMP_DURATION_SERVER": """SELECT DATEDIFF(MINUTE, (SELECT CLOCK_IN FROM UNI_LABOR_TICKET WHERE TRANSACTION_ID = '{TRANSACTION_ID}'), GETDATE()) AS [DURATION]""",

"EMPLOYEE_LAST_30_LABOR_TICKETS": """SELECT DISTINCT TOP 30 WORKORDER_BASE_ID, WORKORDER_LOT_ID, WORKORDER_SPLIT_ID, WORKORDER_SUB_ID
                                    FROM [UNI_LABOR_TICKET] LAB
                                    LEFT JOIN WORK_ORDER WO ON WO.BASE_ID = LAB.WORKORDER_BASE_ID AND WO.LOT_ID = LAB.WORKORDER_LOT_ID AND WO.SPLIT_ID = LAB.WORKORDER_SPLIT_ID AND WO.SUB_ID = LAB.WORKORDER_SUB_ID AND WO.TYPE = 'W'
                                    WHERE LAB.TYPE = 'R' AND WO.STATUS IN ('R', 'F', 'U') AND EMPLOYEE_ID = '{EMP_ID}' """,

"EMPLOYEE_CHECK_FOR_ACTIVE_LABOR_TICKET": """SELECT TOP 1 * 
                                                FROM [UNI_LABOR_TICKET]
                                                WHERE EMPLOYEE_ID = '{EMP_ID}' AND CLOCK_OUT IS NULL
                                                ORDER BY CREATE_DATE DESC""",

"EMPLOYEE_KPIS": """
                    SELECT 
                    ISNULL((SELECT SUM(HOURS_WORKED) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = '{EMP_ID}'  AND TYPE = 'R' AND DATEPART(ISO_WEEK, TRANSACTION_DATE) = DATEPART(ISO_WEEK, GETDATE()) GROUP BY EMPLOYEE_ID),0) /60  AS [TOTAL_WEEK_HRS], 
                    ISNULL((SELECT SUM(HOURS_WORKED) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = '{EMP_ID}' AND TYPE = 'R' AND  CONVERT(DATE, TRANSACTION_DATE) =  CONVERT(DATE, GETDATE()) GROUP BY EMPLOYEE_ID),0) /60 AS [TOTAL_TODAY_HRS]
                                        """,


"UPDATE_LABOR_TICEKT": """
                        UPDATE UNI_LABOR_TICKET
                        SET [DESCRIPTION] = '{DESCRIPTION}',
                            [UDF1] = '{UDF1}',
                            [UDF2] = '{UDF2}',
                            [UDF3] = '{UDF3}',
                            [UDF4] = '{UDF4}',
                            [HOURS_WORKED] = {HOURS_WORKED},
                            [APPROVED] = '{APPROVED}',
                            [APPROVED_BY] = '{APPROVED_BY}',
                            [APPROVED_AT] = '{APPROVED_AT}',
                            [WORK_LOCATION] = '{WORK_LOCATION}',
                            [REGULAR_TIME] = {REGULAR_TIME},
                            [OVER_TIME] = {OVER_TIME},
                            [DOUBLE_TIME] = {DOUBLE_TIME},
                            [QA_NOTES] = '{QA_NOTES}'
                        WHERE TRANSACTION_ID = '{TRANSACTION_ID}'""" ,

"UPDATE_LABOR_TICKET_DOCUMENT": """ UPDATE UNI_LABOR_TICKET
                                    SET [DOCUMENT_PATH] = '{DOCUMENT_PATH}'
                                    WHERE TRANSACTION_ID = '{TRANSACTION_ID}'""",

"GET_ALL_WORKORDER_LIST": """SELECT (ISNULL(CAST(BASE_ID AS VARCHAR),'') + ' - ' + ISNULL(CAST(CO.CUSTOMER_ID AS VARCHAR),'') + ' - ' + ISNULL(CAST(WO.USER_1 AS VARCHAR), '') ) AS 'label', 
                            BASE_ID AS 'value'
                            FROM WORK_ORDER WO
                            LEFT JOIN DEMAND_SUPPLY_LINK DSL ON DSL.SUPPLY_BASE_ID = WO.BASE_ID AND DSL.SUPPLY_LOT_ID = WO.LOT_ID AND DSL.SUPPLY_SPLIT_ID = WO.SPLIT_ID AND DSL.SUPPLY_SUB_ID = WO.SUB_ID
                            LEFT JOIN CUSTOMER_ORDER CO ON CO.ID = DSL.DEMAND_BASE_ID
                            WHERE WO.TYPE = 'W' AND WO.STATUS IN ('R', 'F', 'U') AND WO.SUB_ID = 0
""",

"INSERT_INTO_DOCUMENTS": """
                        INSERT INTO [dbo].[UNI_DOCUMENTS]
                                ([UNIQUE_ID], [TYPE], [FILE_PATH])
                            VALUES
                                ('{TRANSACTION_ID}', '{TYPE}', '{FILE_PATH}' )""",                   

"INSERT_INTO_UNI_USERS_LOGIN": """INSERT INTO UNI_USERS_LOGIN  ([ID]) VALUES ('{EMP_ID}')""",
"UPDATE_CLOCK_OUT_TIME": """UPDATE UNI_USERS_LOGIN SET CLOCK_OUT = GETDATE() WHERE ROWID = (SELECT MAX(ROWID) FROM UNI_USERS_LOGIN WHERE ID = '{EMP_ID}')""",
"GET_USER_CLOCK_IN_DETAILS": """SELECT TOP 1 * FROM UNI_USERS_LOGIN WHERE ID = '{EMP_ID}' AND CLOCK_OUT IS NULL ORDER BY CREATE_DATE DESC""",

"UPDATE_FIELD_LABOR_TICKET": """UPDATE UNI_LABOR_TICKET SET {FIELD} = '{FIELD_VALUE}' WHERE TRANSACTION_ID = {TRANSACTION_ID}"""

}