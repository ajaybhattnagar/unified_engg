export const appConstants = {
    SEARCH_DELAY_MS: 500,
    // BASE_URL: 'http://192.168.2.20:5000/',
    BASE_URL: 'http://localhost:5000/',

    LOGIN: 'api/v1/login',

    SITE_WAREHOUSE: 'api/v1/details/site_warehouse',
    GET_LABOR_TICKETS: 'api/v1/labor/get_labor_tickets',
    GET_WORKORDER_OPERATION_DETAILS: 'api/v1/labor/work_order_operation_details',
    GET_EMPLOYEE_SCAN_DETAILS: 'api/v1/labor/employee_scan_details',
    GET_INDIRECT_CODES: 'api/v1/details/indirectcodes',

    START_LABOR_TICKET: 'api/v1/labor/create_labor_tickets',
    STOP_LABOR_TICKET: 'api/v1/labor/stop_labor_tickets',
    UPDATE_LABOR_TICKETS: 'api/v1/labor/update_labor_tickets',

    UPLOAD_DOCUMENTS: 'api/v1/labor/upload_document',
    UPLOAD_IMAGES: 'api/v1/labor/upload_image',

    USERS: 'api/v1/users', //POST to update, GET to get all users

    DASHBOARD: 'api/v1/details/dashboard',

    GET_LABOR_TICKET_DETAIL_BY_ID: 'api/v1/details/labor_ticket/', 
    GET_DOCUMENTS_WITH_PATH: 'api/v1/details/get_files',
};
