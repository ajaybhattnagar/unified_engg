documents_query = {

"INSERT_DOCUMENTS": """INSERT INTO `Sda`.`DOCUMENTS`
                    (`UNIQUE_ID`,
                    `TITLE`,
                    `LINK`)
                    VALUES
                    ('{UNIQUE_ID}',
                    '{TITLE}',
                    '{LINK}');
                    """,

"GET_ALL_DOCUMENTS_BY_ID": """SELECT ID, DATE_FORMAT(CREATE_DATE, '%d %b, %Y') 'DATE', TITLE, LINK 
                            FROM DOCUMENTS 
                            WHERE UNIQUE_ID = '{ID}' AND IS_ACTIVE = 1""",

"DELETE_NOTES_BY_ID": """UPDATE DOCUMENTS SET IS_ACTIVE = 0 WHERE ID = '{ID}'""",


}