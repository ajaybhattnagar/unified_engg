user_query = {
    
    "ADD_USER_IF_NOT_EXIST": """IF NOT EXISTS (SELECT * FROM [UNI_USERS] WHERE ID = '{EMP_ID}')
                                BEGIN 
                                INSERT INTO UNI_USERS ([ID]) VALUES ('{EMP_ID}')
                                END""",
                                
    "GET_USER_DETAILS": """SELECT * FROM [UNI_USERS] WHERE ID = '{EMP_ID}'""",

    
    
}