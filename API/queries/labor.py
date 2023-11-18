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
                        (CONVERT(DATETIME,GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'Eastern Standard Time'), 
                        '{WORKORDER_TYPE}', '{WORKORDER_ID}', '{WORKORDER_LOT_ID}', '{WORKORDER_SPLIT_ID}', '{WORKORDER_SUB_ID}', '{OPERATION_SEQ_NO}'
                        ,'{RUN_TYPE}', '{RUN_TYPE_STRING}', '{EMP_ID}', '{RESOURCE_ID}',
                        CONVERT(DATETIME,GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'Eastern Standard Time'), 
                        '{DESCRIPTION}', 
                        '{INDIRECT_CODE}', '{INDIRECT_ID}',
                        '{UDF1}', '{UDF2}', '{UDF3}', '{UDF4}',
                        '{WORK_LOCATION}', '{REGULAR_TIME}', '{OVER_TIME}', '{DOUBLE_TIME}', '{QA_NOTES}'
                        );

                SELECT SCOPE_IDENTITY() as id;
""",


"STOP_LABOR_TICKET": """UPDATE UNI_LABOR_TICKET
                            SET [CLOCK_OUT] = CONVERT(DATETIME,GETDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'Eastern Standard Time')
                            WHERE TRANSACTION_ID = '{TRANSACTION_ID}' """,

"GET_WORKORDER_OPERATION_DETAILS": """SELECT OP.SEQUENCE_NO AS [value], OP.RESOURCE_ID AS [label]
                                        /*, OP.WORKORDER_TYPE, OP.WORKORDER_BASE_ID, OP.WORKORDER_LOT_ID, OP.WORKORDER_SPLIT_ID, OP.WORKORDER_SUB_ID,
                                        OP.SEQUENCE_NO, OP.RUN_HRS, OP.RUN_TYPE, 
                                        WO.PART_ID, WO.DESIRED_WANT_DATE, WO.DESIRED_QTY*/
                                    FROM OPERATION OP
                                    LEFT JOIN WORK_ORDER WO ON WO.TYPE = OP.WORKORDER_TYPE AND WO.BASE_ID = OP.WORKORDER_BASE_ID AND WO.LOT_ID = OP.WORKORDER_LOT_ID AND WO.SPLIT_ID = OP.WORKORDER_SPLIT_ID AND WO.SUB_ID = OP.WORKORDER_SPLIT_ID
                                    WHERE WORKORDER_TYPE = '{WORKORDER_TYPE}' AND WORKORDER_BASE_ID = '{WORKORDER_ID}' AND OP.WORKORDER_LOT_ID = {WORKORDER_LOT_ID} AND OP.WORKORDER_SPLIT_ID = {WORKORDER_SPLIT_ID} AND OP.WORKORDER_SUB_ID = {WORKORDER_SUB_ID}""",



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
                        SET [CLOCK_IN] = '{CLOCK_IN}',
                            [CLOCK_OUT] = '{CLOCK_OUT}',
                            [HOURS_BREAK] = {HOURS_BREAK},
                            [DESCRIPTION] = '{DESCRIPTION}',
                            [UDF1] = '{UDF1}',
                            [UDF2] = '{UDF2}',
                            [UDF3] = '{UDF3}',
                            [UDF4] = '{UDF4}',
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

"GET_ALL_WORKORDER_LIST": """SELECT BASE_ID AS 'label', BASE_ID AS 'value'
                            FROM WORK_ORDER 
                            WHERE TYPE = 'W' AND STATUS IN ('R', 'F', 'U')""",

"INSERT_INTO_DOCUMENTS": """
                        INSERT INTO [dbo].[UNI_DOCUMENTS]
                                ([TRANSACTION_ID], [TYPE], [FILE_PATH])
                            VALUES
                                ({TRANSACTION_ID}, '{TYPE}', '{FILE_PATH}' )""",                   



}