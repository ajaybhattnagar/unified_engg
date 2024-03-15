labor_query = {

"CREATE_START_LABOR_TICKET": """
                INSERT INTO UNI_LABOR_TICKET
                        ([TRANSACTION_DATE] ,[WORKORDER_TYPE] ,[WORKORDER_BASE_ID] ,[WORKORDER_LOT_ID], [WORKORDER_SPLIT_ID] ,[WORKORDER_SUB_ID] ,[OPERATION_SEQ_NO]
                        ,[TYPE] ,[TYPE_STRING],[EMPLOYEE_ID] ,[RESOURCE_ID] 
                        ,[CLOCK_IN] 
                        ,[DESCRIPTION]
                        ,[INDIRECT_CODE] ,[INDIRECT_ID]
                        ,[UDF1] ,[UDF2] ,[UDF3] ,[UDF4],
                        [WORK_LOCATION], [WORK_TIME], [QA_NOTES]
                )
                    VALUES
                        (GETDATE(), 
                        '{WORKORDER_TYPE}', '{WORKORDER_ID}', '{WORKORDER_LOT_ID}', '{WORKORDER_SPLIT_ID}', '{WORKORDER_SUB_ID}', '{OPERATION_SEQ_NO}'
                        ,'{RUN_TYPE}', '{RUN_TYPE_STRING}', '{EMP_ID}', '{RESOURCE_ID}',
                        GETDATE(), 
                        '{DESCRIPTION}', 
                        '{INDIRECT_CODE}', '{INDIRECT_ID}',
                        '{UDF1}', '{UDF2}', '{UDF3}', '{UDF4}',
                        '{WORK_LOCATION}', '{WORK_TIME}', '{QA_NOTES}'
                        );

                SELECT SCOPE_IDENTITY() as id;
""",


"STOP_LABOR_TICKET": """UPDATE UNI_LABOR_TICKET
                            SET [CLOCK_OUT] = GETDATE(), 
                                [HOURS_WORKED] = {HOURS_WORKED}
                            WHERE TRANSACTION_ID = '{TRANSACTION_ID}' """,

"GET_WORKORDER_OPERATION_DETAILS": """SELECT OP.SEQUENCE_NO AS [value], (CONVERT(NVARCHAR(MAX), OP.SEQUENCE_NO) + ' ' + LEFT(ISNULL((CONVERT(NVARCHAR(MAX),CONVERT(VARBINARY(8000), OPB.BITS ))),''),45)) AS [label]          
                                        FROM OPERATION OP
                                        LEFT JOIN WORK_ORDER WO ON WO.TYPE = OP.WORKORDER_TYPE AND WO.BASE_ID = OP.WORKORDER_BASE_ID AND WO.LOT_ID = OP.WORKORDER_LOT_ID AND WO.SPLIT_ID = OP.WORKORDER_SPLIT_ID AND WO.SUB_ID = OP.WORKORDER_SUB_ID
                                        LEFT JOIN OPERATION_BINARY OPB ON WO.TYPE = OPB.WORKORDER_TYPE AND WO.BASE_ID = OPB.WORKORDER_BASE_ID AND WO.LOT_ID = OPB.WORKORDER_LOT_ID AND WO.SPLIT_ID = OPB.WORKORDER_SPLIT_ID AND WO.SUB_ID = OPB.WORKORDER_SUB_ID AND OP.SEQUENCE_NO = OPB.SEQUENCE_NO
                                    WHERE OP.WORKORDER_TYPE = '{WORKORDER_TYPE}' AND OP.WORKORDER_BASE_ID = '{WORKORDER_ID}' AND OP.WORKORDER_LOT_ID = {WORKORDER_LOT_ID} AND OP.WORKORDER_SPLIT_ID = {WORKORDER_SPLIT_ID} AND OP.WORKORDER_SUB_ID = {WORKORDER_SUB_ID}""",

"GET_TIMESTAMP_DURATION_SERVER": """SELECT DATEDIFF(MINUTE, (SELECT CLOCK_IN FROM UNI_LABOR_TICKET WHERE TRANSACTION_ID = '{TRANSACTION_ID}'), GETDATE()) AS [DURATION]""",

"EMPLOYEE_LAST_30_LABOR_TICKETS": """SELECT DISTINCT TOP 30 WORKORDER_BASE_ID, WORKORDER_LOT_ID, WORKORDER_SPLIT_ID, WORKORDER_SUB_ID
                                    FROM [UNI_LABOR_TICKET] LAB
                                    LEFT JOIN WORK_ORDER WO ON WO.BASE_ID = LAB.WORKORDER_BASE_ID AND WO.LOT_ID = LAB.WORKORDER_LOT_ID AND WO.SPLIT_ID = LAB.WORKORDER_SPLIT_ID AND WO.SUB_ID = LAB.WORKORDER_SUB_ID AND WO.TYPE = 'W'
                                    WHERE LAB.TYPE = 'R' AND WO.STATUS IN ('R', 'F', 'U') AND EMPLOYEE_ID = '{EMP_ID}' """,

"EMPLOYEE_CHECK_FOR_ACTIVE_LABOR_TICKET": """SELECT TOP 1 ULAB.*,
                                                WO.USER_2 AS 'CUSTOMER_NAME', WO.USER_3 AS [JOB_COORDINATOR], WO.USER_1 AS [WO_DESCRIPTION], WO.USER_5 AS [CUSTOMER_CONTACT],
                                                LEFT(ISNULL((CONVERT(NVARCHAR(MAX),CONVERT(VARBINARY(8000), OPB.BITS ))),''), 50) AS [RESOURCE_DESC]
                                                FROM UNI_LABOR_TICKET ULAB
                                                LEFT JOIN WORK_ORDER WO ON WO.TYPE = ULAB.WORKORDER_TYPE AND WO.BASE_ID = ULAB.WORKORDER_BASE_ID AND WO.LOT_ID = ULAB.WORKORDER_LOT_ID AND WO.SPLIT_ID = ULAB.WORKORDER_SPLIT_ID AND WO.SUB_ID = ULAB.WORKORDER_SUB_ID
                                                LEFT JOIN OPERATION_BINARY OPB ON OPB.WORKORDER_TYPE = 'W' AND  ULAB.WORKORDER_BASE_ID = OPB.WORKORDER_BASE_ID AND ULAB.WORKORDER_LOT_ID = OPB.WORKORDER_LOT_ID AND ULAB.WORKORDER_SPLIT_ID = OPB.WORKORDER_SPLIT_ID AND
                                                ULAB.WORKORDER_SUB_ID = OPB.WORKORDER_SUB_ID AND OPB.SEQUENCE_NO = ULAB.OPERATION_SEQ_NO
                                                WHERE EMPLOYEE_ID = '{EMP_ID}' AND CLOCK_OUT IS NULL
                                                ORDER BY CREATE_DATE DESC""",

"EMPLOYEE_KPIS": """
                    SELECT 
                    ISNULL((SELECT SUM(HOURS_WORKED) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = '{EMP_ID}'  AND TYPE = 'R' AND DATEPART(ISO_WEEK, TRANSACTION_DATE) = DATEPART(ISO_WEEK, GETDATE()) GROUP BY EMPLOYEE_ID),0) AS [TOTAL_WEEK_HRS], 
                    ISNULL((SELECT SUM(HOURS_WORKED) FROM UNI_LABOR_TICKET WHERE EMPLOYEE_ID = '{EMP_ID}' AND TYPE = 'R' AND  CONVERT(DATE, TRANSACTION_DATE) =  CONVERT(DATE, GETDATE()) GROUP BY EMPLOYEE_ID),0) AS [TOTAL_TODAY_HRS]
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
                            [WORK_TIME] = '{WORK_TIME}',
                            [QA_NOTES] = '{QA_NOTES}'
                        WHERE TRANSACTION_ID = '{TRANSACTION_ID}'""" ,

"UPDATE_LABOR_TICKET_DOCUMENT": """ UPDATE UNI_LABOR_TICKET
                                    SET [DOCUMENT_PATH] = '{DOCUMENT_PATH}'
                                    WHERE TRANSACTION_ID = '{TRANSACTION_ID}'""",

"GET_ALL_WORKORDER_LIST": """SELECT DISTINCT (ISNULL(CAST(WO.BASE_ID AS VARCHAR),'') + ' - ' + ISNULL(CAST(CO.CUSTOMER_ID AS VARCHAR),'') + ' - ' + ISNULL(CAST(WO.USER_1 AS VARCHAR), '') ) AS 'label',
                                WO.BASE_ID AS 'value'
                                FROM WORK_ORDER WO
                                LEFT JOIN DEMAND_SUPPLY_LINK DSL ON DSL.DEMAND_TYPE = 'CO' AND DSL.SUPPLY_TYPE = 'WO' AND DSL.SUPPLY_BASE_ID = WO.BASE_ID
                                LEFT JOIN CUSTOMER_ORDER CO ON CO.ID = DSL.DEMAND_BASE_ID
                                WHERE WO.TYPE = 'W' AND WO.STATUS IN ('R', 'F', 'U') AND WO.LOT_ID = '1' AND WO.SPLIT_ID = '0' AND WO.SUB_ID = '0'
                                ORDER BY WO.BASE_ID DESC
""",

"INSERT_INTO_DOCUMENTS": """
                        INSERT INTO [dbo].[UNI_DOCUMENTS]
                                ([UNIQUE_ID], [TYPE], [FILE_PATH])
                            VALUES
                                ('{TRANSACTION_ID}', '{TYPE}', '{FILE_PATH}' )""",                   

"INSERT_INTO_UNI_USERS_LOGIN": """INSERT INTO UNI_USERS_LOGIN  ([ID]) VALUES ('{EMP_ID}')""",
"UPDATE_CLOCK_OUT_TIME": """UPDATE UNI_USERS_LOGIN SET CLOCK_OUT = GETDATE() WHERE ROWID = (SELECT MAX(ROWID) FROM UNI_USERS_LOGIN WHERE ID = '{EMP_ID}')""",
"GET_USER_CLOCK_IN_DETAILS": """SELECT TOP 1 * FROM UNI_USERS_LOGIN WHERE ID = '{EMP_ID}' AND CLOCK_OUT IS NULL ORDER BY CREATE_DATE DESC""",

"UPDATE_FIELD_LABOR_TICKET": """UPDATE UNI_LABOR_TICKET SET {FIELD} = '{FIELD_VALUE}' WHERE TRANSACTION_ID = {TRANSACTION_ID}""",

"DUPLICATE_LABOUR_TICKET": """EXEC DUPLICATE_RECORD_UNI_LABOR_TICKET @TRANS_ID = {TRANSACTION_ID};""",


"LABOUR_SUMMARY_VISUAL_TICKETS": """DECLARE @StartDate DATE = '{FROM_DATE}';
                                    DECLARE @EndDate DATE = '{TO_DATE}';

                                    WITH REG_HRS AS  (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Regular Hours' FROM LABOR_TICKET WHERE MULTIPLIER_1 = 1 AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate GROUP BY EMPLOYEE_ID),
                                        OVER_HRS AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Overtime (1.5)' FROM LABOR_TICKET WHERE MULTIPLIER_1 = 1.5 AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate GROUP BY EMPLOYEE_ID),
                                        DOUB_HRS AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Double Time (2)' FROM LABOR_TICKET WHERE MULTIPLIER_1 = 2 AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate GROUP BY EMPLOYEE_ID),
                                        VAC AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Vacation Hours' FROM LABOR_TICKET WHERE INDIRECT_CODE = 'V' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate GROUP BY EMPLOYEE_ID),
                                        STAT_HOL AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Stat. Hours' FROM LABOR_TICKET WHERE INDIRECT_CODE = 'H' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate GROUP BY EMPLOYEE_ID)

                                    SELECT EMP.ID AS [Employee ID], EMP.FIRST_NAME AS [First Name], EMP.LAST_NAME AS [Last Name], 
                                            ISNULL(REG_HRS.[Regular Hours], 0) AS [Regular Hours], ISNULL(OVER_HRS.[Overtime (1.5)], 0) AS [Overtime (1.5)] , ISNULL(DOUB_HRS.[Double Time (2)], 0) AS [Double Time (2)],
                                            ISNULL(VAC.[Vacation Hours], 0) AS [Vacation Hours], 0 AS [Vacation ($)], 0 AS [Bonus ($)], ISNULL(STAT_HOL.[Stat. Hours], 0) AS [Stat. Hours], 0 AS [Advance pay ($)], 0 AS [Adv. Hours], '' AS [External ID], 
                                            CASE WHEN EMP.TYPE = 'S' THEN DATEDIFF(DAY, @StartDate, @EndDate) * 8 ELSE 0 END AS [Salary Regular Hours], 
		                                    0 AS [Salary Overtime Hours], 0AS [Salary Double Time Hours]
                                    FROM EMPLOYEE EMP
                                    LEFT JOIN REG_HRS ON REG_HRS.EMPLOYEE_ID = EMP.ID
                                    LEFT JOIN OVER_HRS ON OVER_HRS.EMPLOYEE_ID = EMP.ID
                                    LEFT JOIN DOUB_HRS ON DOUB_HRS.EMPLOYEE_ID = EMP.ID
                                    LEFT JOIN VAC ON VAC.EMPLOYEE_ID = EMP.USER_ID
                                    LEFT JOIN STAT_HOL ON STAT_HOL.EMPLOYEE_ID = EMP.ID
                                    WHERE EMP.ACTIVE = 'Y' OR REG_HRS.[Regular Hours] > 0 OR OVER_HRS.[Overtime (1.5)] > 0 OR VAC.[Vacation Hours] > 0 OR STAT_HOL.[Stat. Hours] > 0
                                    ORDER BY EMP.ID""",

"LABOUR_SUMMARY_SUDO_TABLE_FILTER": """DECLARE @StartDate DATE = '{FROM_DATE}';
                                        DECLARE @EndDate DATE = '{TO_DATE}';

                                        WITH REG_HRS AS  (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Regular Hours' FROM UNI_LABOR_TICKET WHERE WORK_TIME = 'Regular Time' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate {APPROVED_STRING} GROUP BY EMPLOYEE_ID),
                                            OVER_HRS AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Overtime (1.5)' FROM UNI_LABOR_TICKET WHERE WORK_TIME = 'Over Time' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate {APPROVED_STRING} GROUP BY EMPLOYEE_ID),
                                            DOUB_HRS AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Double Time (2)' FROM UNI_LABOR_TICKET WHERE WORK_TIME = 'Double Time' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate {APPROVED_STRING} GROUP BY EMPLOYEE_ID),
                                            VAC AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Vacation Hours' FROM UNI_LABOR_TICKET WHERE INDIRECT_ID = 'VAC' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate {APPROVED_STRING} GROUP BY EMPLOYEE_ID),
                                            STAT_HOL AS (SELECT EMPLOYEE_ID, SUM(HOURS_WORKED) AS 'Stat. Hours' FROM UNI_LABOR_TICKET WHERE INDIRECT_ID = 'STAT HOLIDAYS' AND HOURS_WORKED IS NOT NULL AND TRANSACTION_DATE BETWEEN @StartDate AND @EndDate {APPROVED_STRING} GROUP BY EMPLOYEE_ID)

                                        SELECT EMP.ID AS [Employee ID], EMP.FIRST_NAME AS [First Name], EMP.LAST_NAME AS [Last Name], 
                                                ISNULL(REG_HRS.[Regular Hours], 0) AS [Regular Hours], ISNULL(OVER_HRS.[Overtime (1.5)], 0) AS [Overtime (1.5)] , ISNULL(DOUB_HRS.[Double Time (2)], 0) AS [Double Time (2)],
                                                ISNULL(VAC.[Vacation Hours], 0) AS [Vacation Hours], 0 AS [Vacation ($)], 0 AS [Bonus ($)], 0 AS [Stat. Hours], 0 AS [Advance pay ($)], 0 AS [Adv. Hours], '' AS [External ID], 
                                                 CASE WHEN EMP.TYPE = 'S' THEN DATEDIFF(DAY, @StartDate, @EndDate) * 8 ELSE 0 END AS [Salary Regular Hours], 
		                                         0 AS [Salary Overtime Hours], 0AS [Salary Double Time Hours]
                                        FROM EMPLOYEE EMP
                                        LEFT JOIN REG_HRS ON REG_HRS.EMPLOYEE_ID = EMP.USER_ID
                                        LEFT JOIN OVER_HRS ON OVER_HRS.EMPLOYEE_ID = EMP.USER_ID
                                        LEFT JOIN DOUB_HRS ON DOUB_HRS.EMPLOYEE_ID = EMP.USER_ID
                                        LEFT JOIN VAC ON VAC.EMPLOYEE_ID = EMP.USER_ID
                                        LEFT JOIN STAT_HOL ON STAT_HOL.EMPLOYEE_ID = EMP.USER_ID
                                        WHERE EMP.ACTIVE = 'Y' OR REG_HRS.[Regular Hours] > 0 OR OVER_HRS.[Overtime (1.5)] > 0 OR VAC.[Vacation Hours] > 0 OR STAT_HOL.[Stat. Hours] > 0 
                                        ORDER BY EMP.ID"""

}