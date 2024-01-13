export const appConstants = {
    SEARCH_DELAY_MS: 500,

    // DEPLOYEMENT_URL: 'http://localhost:8080/',
    DEPLOYEMENT_URL: 'https://uni-vm-visdev.unified.local/',
    // DEPLOYEMENT_URL: 'https://unified.ajaybhattnagar.com/',

    // BASE_URL: 'http://localhost:5000/',
    BASE_URL: 'https://uni-vm-visdev.unified.local:5003/',
    // BASE_URL: 'https://uni-api.visuify.com/',
    

    // VISUAL_API: 'http://localhost:44360/',
    VISUAL_API: 'https://uni-vm-visdev.unified.local:5005/',

    LOGIN: 'api/v1/login',

    SITE_WAREHOUSE: 'api/v1/details/site_warehouse',
    GET_LABOR_TICKETS: 'api/v1/labor/get_labor_tickets',
    GET_WORKORDER_OPERATION_DETAILS: 'api/v1/labor/work_order_operation_details',
    GET_EMPLOYEE_SCAN_DETAILS: 'api/v1/labor/employee_scan_details',
    GET_INDIRECT_CODES: 'api/v1/details/indirectcodes',

    START_LABOR_TICKET: 'api/v1/labor/create_labor_tickets',
    STOP_LABOR_TICKET: 'api/v1/labor/stop_labor_tickets',
    UPDATE_LABOR_TICKETS: 'api/v1/labor/update_labor_tickets',
    UPDATE_LABOR_TICKET_FIELD: '/api/v1/labor/update_labor_ticket/',

    UPLOAD_DOCUMENTS: 'api/v1/labor/upload_document',
    UPLOAD_IMAGES: 'api/v1/labor/upload_image',
    GET_ALL_FILES_FROM_U_DRIVE: 'api/v1/details/u_drive_files/',

    USERS: 'api/v1/users', //POST to update, GET to get all users

    DASHBOARD: 'api/v1/details/dashboard',

    GET_LABOR_TICKET_DETAIL_BY_ID: 'api/v1/details/labor_ticket/', 
    GET_DOCUMENTS_WITH_PATH: 'api/v1/details/get_files',
    CREATE_LABOR_TICKET_VISUAL: 'api/ShopFloor/CreateLaborTicketBulk',

    CLOCK_IN_OUT_USER: 'api/v1/labor/clock_in_out/',

    GET_ALL_ACTIVE_WORKORDER_DETAILS: 'api/v1/details/work_order',
    GET_ALL_EMPLOYEES: 'api/v1/details/employees',
    GET_UPDATE_OPERATION_DETAILS: 'api/v1/details/operation',

    GET_PURCHASE_ORDERS: 'api/v1/purchasing/get_purchase_order', // ADD PO ID AS PARAMS TO GET LINES 
    CREATE_RECEIVER_VISUAL: 'api/Purchasing/ReceiveOrder',
};
