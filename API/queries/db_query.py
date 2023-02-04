db_query = {

"REGISTER_USER": """INSERT INTO `Sda`.`USERS`
                    (
                    `EMAIL`,
                    `PASSWORD`)
                    VALUES
                    (
                    '{EMAIL}',
                    '{PASSWORD}');
                    """,

"USER_CHECK": """select COUNT(*) 'COUNT' from `Sda`.`USERS` WHERE EMAIL = '{EMAIL}' AND IS_ACTIVE = 1;""",

"USER_DETAILS": """SELECT * FROM `Sda`.`USERS` WHERE EMAIL = '{EMAIL}' AND IS_ACTIVE = 1 LIMIT 1;""",

}