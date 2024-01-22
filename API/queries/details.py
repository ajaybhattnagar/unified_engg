details_query = {

"GET_SITES": """SELECT ID AS [value], SITE_NAME AS [label] FROM SITE""",
"GET_WAREHOUSES": """SELECT ID AS [value], DESCRIPTION AS [label] FROM WAREHOUSE""",

"GET_INDIRECT_CODES": """SELECT ROWID, ID AS [value], DESCRIPTION AS [label] FROM INDIRECT""",


"GET_LABOR_TICKETS": """SELECT 
                        ULAB.TRANSACTION_ID, ULAB.WORKORDER_BASE_ID,  
                        CONCAT(CONVERT(VARCHAR(10), ULAB.WORKORDER_LOT_ID), ' - ', CONVERT(VARCHAR(10), ULAB.WORKORDER_SPLIT_ID), ' - ',  CONVERT(VARCHAR(10), ULAB.WORKORDER_SUB_ID)) AS [LOT_SPLIT_SUB],
                        CONVERT(VARCHAR, ULAB.CLOCK_IN, 22) AS [CLOCK_IN], CONVERT(VARCHAR, ULAB.CLOCK_OUT, 22) AS [CLOCK_OUT],
                        ULAB.HOURS_WORKED, ULAB.HOURS_BREAK, ULAB.INDIRECT_CODE, ULAB.INDIRECT_ID,
                        CASE WHEN ULAB.APPROVED = 0 THEN 'false'
                            WHEN ULAB.APPROVED = 1 THEN 'true' ELSE 'false' END AS [APPROVED] ,
                        ULAB.APPROVED_AT, ULAB.APPROVED_BY,
                        ULAB.DESCRIPTION AS [LAB_DESC], ULAB.UDF1, ULAB.UDF2, ULAB.UDF3, ULAB.UDF4, ULAB.WORK_LOCATION, ULAB.REGULAR_TIME, ULAB.OVER_TIME, ULAB.DOUBLE_TIME, ULAB.QA_NOTES,
                        WO.PART_ID, WO.DESIRED_QTY, CAST(WO.DESIRED_WANT_DATE AS DATE) AS [DESIRED_WANT_DATE], WO.STATUS, WO.ENGINEERED_BY, WO.ACT_MATERIAL_COST, WO.ACT_LABOR_COST, WO.ACT_SERVICE_COST, 
                        CO.ID, CO.CUSTOMER_ID, CO.CUSTOMER_PO_REF, CO.STATUS, CO.TOTAL_AMT_ORDERED, CO.TOTAL_AMT_SHIPPED,  WO.USER_1 AS [PART_DESC], ULAB.EMPLOYEE_ID, ULAB.VISUAL_LAB_TRANS_ID,
                        WO.USER_1
                        FROM UNI_LABOR_TICKET ULAB
                        LEFT JOIN WORK_ORDER WO ON WO.BASE_ID = ULAB.WORKORDER_BASE_ID AND WO.LOT_ID = ULAB.WORKORDER_LOT_ID AND WO.SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND WO.SUB_ID = ULAB.WORKORDER_SUB_ID AND WO.TYPE = 'W'
                        LEFT JOIN PART ON PART.ID = WO.PART_ID
                        LEFT JOIN CUSTOMER_ORDER CO ON CO.ID = (SELECT TOP 1 DEMAND_BASE_ID FROM DEMAND_SUPPLY_LINK WHERE SUPPLY_BASE_ID = ULAB.WORKORDER_BASE_ID AND SUPPLY_LOT_ID = ULAB.WORKORDER_LOT_ID AND SUPPLY_SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND SUPPLY_SUB_ID = ULAB.WORKORDER_SUB_ID AND SUPPLY_TYPE = 'WO' AND DEMAND_TYPE = 'CO')
                        WHERE HOURS_WORKED IS NOT NULL AND CONVERT(DATE, TRANSACTION_DATE) BETWEEN '{FROM_DATE}' AND '{TO_DATE}' {EMP_ID_QUERY_STRING} {APPROVED_QUERY_STRING}""",

"GET_ACTIVE_LABOR_TICKETS": """SELECT 
                                ULAB.TRANSACTION_ID, ULAB.WORKORDER_BASE_ID,  
                                CONCAT(CONVERT(VARCHAR(10), ULAB.WORKORDER_LOT_ID), ' - ', CONVERT(VARCHAR(10), ULAB.WORKORDER_SPLIT_ID), ' - ',  CONVERT(VARCHAR(10), ULAB.WORKORDER_SUB_ID)) AS [LOT_SPLIT_SUB],
                                CONVERT(VARCHAR, ULAB.CLOCK_IN, 22) AS [CLOCK_IN], CONVERT(VARCHAR, ULAB.CLOCK_OUT, 22) AS [CLOCK_OUT],
                                ULAB.HOURS_WORKED, ULAB.HOURS_BREAK, ULAB.INDIRECT_CODE, ULAB.INDIRECT_ID,
                                CASE WHEN ULAB.APPROVED = 0 THEN 'false'
                                    WHEN ULAB.APPROVED = 1 THEN 'true' ELSE 'false' END AS [APPROVED] ,
                                ULAB.APPROVED_AT, ULAB.APPROVED_BY,
                                ULAB.DESCRIPTION AS [LAB_DESC], ULAB.UDF1, ULAB.UDF2, ULAB.UDF3, ULAB.UDF4, ULAB.WORK_LOCATION, ULAB.REGULAR_TIME, ULAB.OVER_TIME, ULAB.DOUBLE_TIME, ULAB.QA_NOTES,
                                WO.PART_ID, WO.DESIRED_QTY, CAST(WO.DESIRED_WANT_DATE AS DATE) AS [DESIRED_WANT_DATE], WO.STATUS, WO.ENGINEERED_BY, WO.ACT_MATERIAL_COST, WO.ACT_LABOR_COST, WO.ACT_SERVICE_COST, 
                                CO.ID, CO.CUSTOMER_ID, CO.CUSTOMER_PO_REF, CO.STATUS, CO.TOTAL_AMT_ORDERED, CO.TOTAL_AMT_SHIPPED,  WO.USER_1 AS [PART_DESC], ULAB.EMPLOYEE_ID, ULAB.VISUAL_LAB_TRANS_ID,
                                WO.USER_1
                                FROM UNI_LABOR_TICKET ULAB
                                LEFT JOIN WORK_ORDER WO ON WO.BASE_ID = ULAB.WORKORDER_BASE_ID AND WO.LOT_ID = ULAB.WORKORDER_LOT_ID AND WO.SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND WO.SUB_ID = ULAB.WORKORDER_SUB_ID AND WO.TYPE = 'W'
                                LEFT JOIN PART ON PART.ID = WO.PART_ID
                                LEFT JOIN CUSTOMER_ORDER CO ON CO.ID = (SELECT TOP 1 DEMAND_BASE_ID FROM DEMAND_SUPPLY_LINK WHERE SUPPLY_BASE_ID = ULAB.WORKORDER_BASE_ID AND SUPPLY_LOT_ID = ULAB.WORKORDER_LOT_ID AND SUPPLY_SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND SUPPLY_SUB_ID = ULAB.WORKORDER_SUB_ID AND SUPPLY_TYPE = 'WO' AND DEMAND_TYPE = 'CO')
                                WHERE ISNULL(HOURS_WORKED, HOURS_BREAK) IS NULL --OR HOURS_BREAK IS NULL
                                ORDER BY TRANSACTION_DATE DESC """,

"GET_ALL_EMPLOYEE_HOURS_KPI": """SELECT DISTINCT EMPLOYEE_ID,
                                (SELECT SUM(HOURS_WORKED) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = LAB.EMPLOYEE_ID AND TYPE = 'R' AND DATEPART(ISO_WEEK, TRANSACTION_DATE) = DATEPART(ISO_WEEK, GETDATE())) AS [TOTAL_WEEK_HRS],
                                (SELECT SUM(HOURS_WORKED) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = LAB.EMPLOYEE_ID AND TYPE = 'R' AND  CONVERT(DATE, TRANSACTION_DATE) =  CONVERT(DATE, GETDATE())) AS [TOTAL_TODAY_HRS] 
                                FROM UNI_LABOR_TICKET LAB""",

"GET_CLOCK_IN_VS_LABOR_KPI": """SELECT DISTINCT ID,
                                (SELECT COUNT(*) FROM UNI_USERS_LOGIN WHERE ID = USERS.ID AND CLOCK_OUT IS NULL AND CAST(CREATE_DATE AS DATE) = CAST(GETDATE() AS DATE)) AS [IS_CLOCKED_IN],
                                (SELECT COUNT(*) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = USERS.ID AND CLOCK_OUT IS NULL AND CAST(CREATE_DATE AS DATE) = CAST(GETDATE() AS DATE)) AS [IS_LABOR_START]
                                FROM UNI_USERS USERS""",

"GET_LABOR_TICKET_BY_ID": """SELECT 
                            ULAB.TRANSACTION_ID, ULAB.WORKORDER_BASE_ID,  
                            CONCAT(CONVERT(VARCHAR(10), ULAB.WORKORDER_LOT_ID), ' - ', CONVERT(VARCHAR(10), ULAB.WORKORDER_SPLIT_ID), ' - ',  CONVERT(VARCHAR(10), ULAB.WORKORDER_SUB_ID)) AS [LOT_SPLIT_SUB],
                            CONVERT(VARCHAR, ULAB.CLOCK_IN, 22) AS [CLOCK_IN], CONVERT(VARCHAR, ULAB.CLOCK_OUT, 22) AS [CLOCK_OUT],
                            ULAB.HOURS_WORKED, ULAB.INDIRECT_CODE, ULAB.INDIRECT_ID,
                            CASE WHEN ULAB.APPROVED = 0 THEN 'false'
                                WHEN ULAB.APPROVED = 1 THEN 'true' ELSE 'false' END AS [APPROVED] ,
                            ULAB.APPROVED_AT, ULAB.APPROVED_BY,
                            ULAB.DESCRIPTION AS [LAB_DESC], ULAB.UDF1, ULAB.UDF2, ULAB.UDF3, ULAB.UDF4, ULAB.WORK_LOCATION, ULAB.REGULAR_TIME, ULAB.OVER_TIME, ULAB.DOUBLE_TIME, ULAB.QA_NOTES,
                            WO.PART_ID, WO.DESIRED_QTY, CAST(WO.DESIRED_WANT_DATE AS DATE) AS [DESIRED_WANT_DATE], WO.STATUS,
                            CO.ID, CO.CUSTOMER_ID, CO.CUSTOMER_PO_REF, CO.STATUS,  WO.USER_1 AS [PART_DESC], ULAB.EMPLOYEE_ID, ULAB.VISUAL_LAB_TRANS_ID,
                            WO.USER_1
                            FROM UNI_LABOR_TICKET ULAB
                            LEFT JOIN WORK_ORDER WO ON WO.BASE_ID = ULAB.WORKORDER_BASE_ID AND WO.LOT_ID = ULAB.WORKORDER_LOT_ID AND WO.SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND WO.SUB_ID = ULAB.WORKORDER_SUB_ID AND WO.TYPE = 'W'
                            LEFT JOIN PART ON PART.ID = WO.PART_ID
                            LEFT JOIN CUSTOMER_ORDER CO ON CO.ID = (SELECT TOP 1 DEMAND_BASE_ID FROM DEMAND_SUPPLY_LINK WHERE SUPPLY_BASE_ID = ULAB.WORKORDER_BASE_ID AND SUPPLY_LOT_ID = ULAB.WORKORDER_LOT_ID AND SUPPLY_SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND SUPPLY_SUB_ID = ULAB.WORKORDER_SUB_ID AND SUPPLY_TYPE = 'WO' AND DEMAND_TYPE = 'CO')
                            WHERE TRANSACTION_ID = {TRANSACTION_ID}""",

"GET_ALL_DOCUMENTS_IMAGES_BY_ID": """SELECT * 
                                    FROM UNI_DOCUMENTS
                                    WHERE UNIQUE_ID = '{TRANSACTION_ID}'
                                    ORDER BY CREATE_DATE DESC""",

"GET_UPLOAD_DOCUMENTS_IMAGES": """SELECT DOC.*, CONVERT(VARCHAR, DOC.CREATE_DATE, 22) AS [DATE],
                                    ISNULL(LAB.WORKORDER_BASE_ID, 'PURCHASE ORDER') AS [ORDER_TYPE], LAB.DESCRIPTION, LAB.QA_NOTES, LAB.RESOURCE_ID
                                    FROM UNI_DOCUMENTS DOC
                                    LEFT JOIN UNI_LABOR_TICKET LAB ON LAB.TRANSACTION_ID = DOC.UNIQUE_ID
                                    WHERE CAST(DOC.CREATE_DATE AS DATE) BETWEEN '{FROM_DATE}' AND '{TO_DATE}'
                                    ORDER BY DOC.CREATE_DATE DESC""",
"GET_SENT_NOTIFICATIONS": """SELECT NOTI.*, CONVERT(VARCHAR, NOTI.CREATE_DATE, 22) AS [DATE],
                            ISNULL(LAB.WORKORDER_BASE_ID, 'PURCHASE ORDER') AS [ORDER_TYPE], LAB.DESCRIPTION, LAB.QA_NOTES, LAB.RESOURCE_ID
                            FROM UNI_NOTIFICATION NOTI
                            LEFT JOIN UNI_LABOR_TICKET LAB ON LAB.TRANSACTION_ID = NOTI.UNIQUE_ID
                            WHERE CAST(NOTI.CREATE_DATE AS DATE) BETWEEN '{FROM_DATE}' AND '{TO_DATE}'
                            ORDER BY NOTI.CREATE_DATE DESC""",

"GET_DATA_FOR_CREATING_LABOR_TICKET_IN_VISUAL": """SELECT *, CASE WHEN (HOURS_WORKED_Z/60 - FLOOR(HOURS_WORKED_Z/60)) BETWEEN 0 AND 0.25 THEN FLOOR(HOURS_WORKED_Z/60) + 0.25
                                                    WHEN (HOURS_WORKED_Z/60 - FLOOR(HOURS_WORKED_Z/60)) BETWEEN 0.25 AND 0.50 THEN FLOOR(HOURS_WORKED_Z/60) + 0.50
                                                    WHEN (HOURS_WORKED_Z/60 - FLOOR(HOURS_WORKED_Z/60)) BETWEEN 0.50 AND 0.75 THEN FLOOR(HOURS_WORKED_Z/60) + 0.75
                                                    WHEN (HOURS_WORKED_Z/60 - FLOOR(HOURS_WORKED_Z/60)) BETWEEN 0.75 AND 0.99 THEN FLOOR(HOURS_WORKED_Z/60) + 1 ELSE 0 END AS [HOURS_WORKED] FROM (
                                                SELECT TRANSACTION_ID AS [UNI_TRANSACTION_ID],
                                                CASE WHEN TYPE = 'R' THEN 'RUN'
                                                WHEN TYPE = 'I' THEN 'INDIRECT' ELSE '' END AS 'TRANSACTION_TYPE',
                                                WORKORDER_BASE_ID, WORKORDER_LOT_ID, WORKORDER_SPLIT_ID, WORKORDER_SUB_ID, OPERATION_SEQ_NO, CLOCK_IN, CLOCK_OUT, 
                                                CASE 
                                                    WHEN TYPE = 'R' THEN ROUND(CONVERT(DECIMAL(10, 2), HOURS_WORKED) * 4, 0) / 4 
                                                    WHEN TYPE = 'I' THEN ROUND(CONVERT(DECIMAL(10, 2), HOURS_BREAK) * 4, 0) / 4  
                                                    ELSE '' 
                                                END AS 'HOURS_WORKED_Z',
                                                REGULAR_TIME, DOUBLE_TIME, OVER_TIME, DESCRIPTION, EMPLOYEE_ID, INDIRECT_CODE AS [INDIRECT_ID]
                                                FROM UNI_LABOR_TICKET
                                                WHERE APPROVED = 1 AND VISUAL_LAB_TRANS_ID IS NULL
                                                ) Z""",

"GET_WORKORDER_HEADER_DETAILS" : """SELECT ROWID, TYPE, BASE_ID, LOT_ID, SPLIT_ID, SUB_ID, PART_ID, DESIRED_QTY, RECEIVED_QTY, CREATE_DATE, DESIRED_WANT_DATE
                                    FROM WORK_ORDER 
                                    WHERE TYPE = 'W' AND BASE_ID = '{BASE_ID}' AND LOT_ID = 1 AND SPLIT_ID = 0 """,
"GET_OPERATION_DETAILS_PER_SUB_ID": """SELECT OP.*, SR.DESCRIPTION AS [OP_DESCRIPTION],
                                        ISNULL((CONVERT(NVARCHAR(MAX),CONVERT(VARBINARY(8000), OPB.BITS ))),'') AS [NOTES],
                                        (SELECT COUNT(*) FROM UNI_QUALITY_UPDATES 
                                            WHERE WORKORDER_BASE_ID = OP.WORKORDER_BASE_ID AND WORKORDER_LOT_ID = OP.WORKORDER_LOT_ID AND WORKORDER_SPLIT_ID = OP.WORKORDER_SPLIT_ID 
                                            AND WORKORDER_SUB_ID = OP.WORKORDER_SUB_ID AND OPERATION_SEQ_NO = OP.SEQUENCE_NO AND WORKORDER_TYPE = 'W' AND NOTIFY_EMPLOYEE IS NOT NULL) AS [NOTIFY]
                                        FROM OPERATION OP
                                        LEFT JOIN OPERATION_BINARY OPB ON OPB.WORKORDER_TYPE = 'W' AND  OP.WORKORDER_BASE_ID = OPB.WORKORDER_BASE_ID AND OP.WORKORDER_LOT_ID = OPB.WORKORDER_LOT_ID AND OP.WORKORDER_SPLIT_ID = OPB.WORKORDER_SPLIT_ID AND
                                            OP.WORKORDER_SUB_ID = OPB.WORKORDER_SUB_ID AND OPB.SEQUENCE_NO = OP.SEQUENCE_NO
                                        LEFT JOIN SHOP_RESOURCE SR ON SR.ID = OP.RESOURCE_ID
                                        WHERE OP.WORKORDER_TYPE = 'W' AND OP.WORKORDER_BASE_ID = '{BASE_ID}' AND OP.WORKORDER_LOT_ID = 1 AND OP.WORKORDER_SPLIT_ID = 0 AND OP.WORKORDER_SUB_ID = {SUB_ID}""",

"GET_ALL_ACTIVE_WORKORDERS": """SELECT DISTINCT WO.BASE_ID, WO.SPLIT_ID, WO.SUB_ID, WO.PART_ID, CO.CURRENCY_ID, CO.CUSTOMER_ID, CO.CUSTOMER_PO_REF, WO.DESIRED_QTY, WO.DESIRED_WANT_DATE
                                FROM WORK_ORDER WO
                                LEFT JOIN DEMAND_SUPPLY_LINK DSL ON DSL.SUPPLY_BASE_ID = WO.BASE_ID AND DSL.SUPPLY_LOT_ID = WO.LOT_ID AND DSL.SUPPLY_SPLIT_ID = WO.SPLIT_ID AND DSL.SUPPLY_SUB_ID = WO.SUB_ID
                                LEFT JOIN CUSTOMER_ORDER CO ON CO.ID = DSL.DEMAND_BASE_ID
                                WHERE WO.TYPE = 'W' AND WO.STATUS IN ('R', 'F', 'U') AND WO.SUB_ID = 0""",

"GET_ALL_EMPLOYEES": """SELECT * FROM EMPLOYEE WHERE ACTIVE = 'Y' AND EMAIL_ADDR IS NOT NULL""",

"GET_QUALITY_UPDATES": """SELECT OP.*, 
                    ISNULL((CONVERT(NVARCHAR(MAX),CONVERT(VARBINARY(8000), OPB.BITS ))),'') AS [NOTES], 
                    UQ.NOTIFY_EMPLOYEE, UQ.FAB_SIGN_OFF, UQ.QA_SIGN_OFF, UQ.QA_ACCEPT, UQ.QA_REJECT, UQ.NOTES AS [NOTES_1], UQ.EMPLOYEE_ID, CONVERT(VARCHAR, UQ.CREATE_DATE, 22) AS [CREATE_DATE]
                    FROM OPERATION OP
                    LEFT JOIN OPERATION_BINARY OPB ON OPB.WORKORDER_TYPE = 'W' AND  OP.WORKORDER_BASE_ID = OPB.WORKORDER_BASE_ID AND OP.WORKORDER_LOT_ID = OPB.WORKORDER_LOT_ID AND OP.WORKORDER_SPLIT_ID = OPB.WORKORDER_SPLIT_ID AND
                        OP.WORKORDER_SUB_ID = OPB.WORKORDER_SUB_ID AND OPB.SEQUENCE_NO = OP.SEQUENCE_NO
                    LEFT JOIN UNI_QUALITY_UPDATES UQ ON UQ.WORKORDER_TYPE = 'W' AND  OP.WORKORDER_BASE_ID = UQ.WORKORDER_BASE_ID AND OP.WORKORDER_LOT_ID = UQ.WORKORDER_LOT_ID AND OP.WORKORDER_SPLIT_ID = UQ.WORKORDER_SPLIT_ID AND
                        OP.WORKORDER_SUB_ID = UQ.WORKORDER_SUB_ID AND OP.SEQUENCE_NO = UQ.OPERATION_SEQ_NO
                    WHERE OP.WORKORDER_TYPE = 'W' AND OP.WORKORDER_BASE_ID = '{BASE_ID}' AND OP.WORKORDER_LOT_ID = 1 AND OP.WORKORDER_SPLIT_ID = 0 AND OP.WORKORDER_SUB_ID = {SUB_ID}""",
"ADD_QUALITY_RECORD": """INSERT INTO [dbo].[UNI_QUALITY_UPDATES]
                            ([WORKORDER_TYPE],[WORKORDER_BASE_ID],[WORKORDER_LOT_ID],[WORKORDER_SPLIT_ID],[WORKORDER_SUB_ID]
                            ,[OPERATION_SEQ_NO],[NOTIFY_EMPLOYEE],[FAB_SIGN_OFF],[QA_SIGN_OFF],[QA_ACCEPT],[QA_REJECT],[NOTES],[EMPLOYEE_ID])
                        VALUES
                            ('W', '{BASE_ID}', '1', '0', '{SUB_ID}', 
                            {OPERATION_SEQ_NO}, '{NOTIFY_EMPLOYEE}', '{FAB_SIGN_OFF}', '{QA_SIGN_OFF}', '{QA_ACCEPT}', '{QA_REJECT}', '{NOTES}', '{EMPLOYEE_ID}')""",

"INSERT_INTO_UNI_NOTIFICATION": """INSERT INTO [dbo].[UNI_NOTIFICATION]
           ([UNIQUE_ID], [TYPE], [TEMPLATE], [RECIPIENTS])
     VALUES ('{UNIQUE_ID}', '{TYPE}', '{TEMPLATE}', '{RECIPIENTS}')""",

}