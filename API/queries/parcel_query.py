parcel_query = {

"SEARCH_PARCEL": """SELECT * 
                    FROM PARCELS 
                    WHERE TSRID LIKE '{TEXT}' OR STATE LIKE '{TEXT}' OR MUNICIPALITY LIKE '{TEXT}' 
                    OR LOCATION_FULL_STREET_ADDRESS LIKE '{TEXT}' OR UNIQUE_ID LIKE '{TEXT}' """,

"GET_PARCELS_BASED_ON_FILTERS": """SELECT * 
                    FROM PARCELS 
                    WHERE STATE LIKE '{STATE}' {COUNTY} {MUNICIPALITY} {STATUS} """,


"GET_DISTINCT_STATES": """SELECT DISTINCT STATE FROM PARCELS""",
"GET_DISTINCT_COUNTY": """SELECT DISTINCT COUNTY FROM PARCELS""",
"GET_DISTINCT_MUNICIPALITY": """SELECT DISTINCT MUNICIPALITY FROM PARCELS""",



}