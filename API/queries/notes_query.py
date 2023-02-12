notes_query = {

"INSERT_NOTES": """INSERT INTO NOTES
                    (`UNIQUE_ID`,`NOTES`)
                    VALUES
                    ('{UNIQUE_ID}', CONVERT('{STRING}' USING utf8mb4));
                    """,

"GET_ALL_NOTES_BY_ID": """SELECT ID, DATE_FORMAT(CREATE_DATE, '%d %b, %Y') 'DATE', CONVERT(NOTES USING utf8mb4) AS `NOTES`
                            FROM NOTES 
                            WHERE UNIQUE_ID = '{UNIQUE_ID}' AND IS_ACTIVE = 1""",

"DELETE_NOTES_BY_ID": """UPDATE NOTES SET IS_ACTIVE = 0 WHERE ID = '{ID}'""",


}