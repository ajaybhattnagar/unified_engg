purchasing_query = {

"GET_PURCHASE_ORDER_R_F": """SELECT PO.ID AS [value], PO.ID + ' - ' + EMP.FIRST_NAME + ' ' + EMP.LAST_NAME AS [label] 
                                FROM PURCHASE_ORDER PO
                                LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = PO.BUYER
                                WHERE STATUS IN ('R', 'F')""",

"GET_PURCHASE_ORDER_BY_ID": """SELECT PO.ID, POL.LINE_NO, PO.STATUS, PO.VENDOR_ID, PO.ORDER_DATE, PO.BUYER, PART.DESCRIPTION,
                                POL.PART_ID, POL.MFG_PART_ID, POL.USER_ORDER_QTY, POL.TOTAL_USR_RECD_QTY, (POL.USER_ORDER_QTY - POL.TOTAL_USR_RECD_QTY) AS [BALANCE],
                                (SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM TRACE_PROFILE WHERE PART_ID = PART.ID AND APPLY_TO_ISSUE = 'Y') AS [TRACE_AVAIL_CHECK],
                                LENGTH_REQD, WIDTH_REQD, HEIGHT_REQD, PIECE_TRACKED, PO.BUYER, (EMP.FIRST_NAME + ' ' + EMP.LAST_NAME) AS [BUYER_NAME], EMP.EMAIL_ADDR
                                FROM PURCHASE_ORDER PO
                                LEFT JOIN PURC_ORDER_LINE POL ON POL.PURC_ORDER_ID = PO.ID
                                LEFT JOIN PART ON PART.ID = POL.PART_ID
                                LEFT JOIN EMPLOYEE EMP ON EMP.USER_ID = PO.BUYER
                                WHERE POL.LINE_NO IS NOT NULL AND PO.ID = '{ID}'""",




"GET_WAREHOUSES": """SELECT ID AS [value], DESCRIPTION AS [label] FROM WAREHOUSE""",

}