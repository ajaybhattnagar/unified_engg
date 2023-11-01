labor_query = {

"CREATE_START_LABOR_TICKET": """
                INSERT INTO UNI_LABOR_TICKET
                        ([TRANSACTION_DATE] ,[WORKORDER_TYPE] ,[WORKORDER_BASE_ID] ,[WORKORDER_LOT_ID], [WORKORDER_SPLIT_ID] ,[WORKORDER_SUB_ID] ,[OPERATION_SEQ_NO]
                        ,[TYPE] ,[TYPE_STRING],[EMPLOYEE_ID] ,[RESOURCE_ID] 
                        ,[CLOCK_IN] 
                        ,[DESCRIPTION]
                        ,[INDIRECT_CODE] ,[INDIRECT_ID]
                        ,[UDF1] ,[UDF2] ,[UDF3] ,[UDF4]
                )
                    VALUES
                        (GETDATE(), '{WORKORDER_TYPE}', '{WORKORDER_ID}', '{WORKORDER_LOT_ID}', '{WORKORDER_SPLIT_ID}', '{WORKORDER_SUB_ID}', '{OPERATION_SEQ_NO}'
                        ,'{RUN_TYPE}', '{RUN_TYPE_STRING}', '{EMP_ID}', '{RESOURCE_ID}',
                        GETDATE(), 
                        '{DESCRIPTION}', 
                        '{INDIRECT_CODE}', '{INDIRECT_ID}',
                        '{UDF1}', '{UDF2}', '{UDF3}', '{UDF4}'
                        )
""",

"STOP_LABOR_TICKET": """UPDATE UNI_LABOR_TICKET
                            SET [CLOCK_OUT] = GETDATE()
                            WHERE TRANSACTION_ID = '{TRANSACTION_ID}' """,

"GET_WORKORDER_OPERATION_DETAILS": """SELECT OP.SEQUENCE_NO AS [value], OP.RESOURCE_ID AS [label]
                                        /*, OP.WORKORDER_TYPE, OP.WORKORDER_BASE_ID, OP.WORKORDER_LOT_ID, OP.WORKORDER_SPLIT_ID, OP.WORKORDER_SUB_ID,
                                        OP.SEQUENCE_NO, OP.RUN_HRS, OP.RUN_TYPE, 
                                        WO.PART_ID, WO.DESIRED_WANT_DATE, WO.DESIRED_QTY*/
                                    FROM OPERATION OP
                                    LEFT JOIN WORK_ORDER WO ON WO.TYPE = OP.WORKORDER_TYPE AND WO.BASE_ID = OP.WORKORDER_BASE_ID AND WO.LOT_ID = OP.WORKORDER_LOT_ID AND WO.SPLIT_ID = OP.WORKORDER_SPLIT_ID AND WO.SUB_ID = OP.WORKORDER_SPLIT_ID
                                    WHERE WORKORDER_TYPE = '{WORKORDER_TYPE}' AND WORKORDER_BASE_ID = '{WORKORDER_ID}' AND OP.WORKORDER_LOT_ID = {WORKORDER_LOT_ID} AND OP.WORKORDER_SPLIT_ID = {WORKORDER_SPLIT_ID} AND OP.WORKORDER_SUB_ID = {WORKORDER_SUB_ID}""",



"EMPLOYEE_LAST_30_LABOR_TICKETS": """SELECT TOP 30 * 
                                    FROM [UNI_LABOR_TICKET]
                                    WHERE EMPLOYEE_ID = '{EMP_ID}' 
                                    ORDER BY CREATE_DATE DESC """,

"EMPLOYEE_CHECK_FOR_ACTIVE_LABOR_TICKET": """SELECT TOP 1 * 
                                                FROM [UNI_LABOR_TICKET]
                                                WHERE EMPLOYEE_ID = '{EMP_ID}' AND CLOCK_OUT IS NULL
                                                ORDER BY CREATE_DATE DESC"""

}