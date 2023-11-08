export const appConstants = {
    SEARCH_DELAY_MS: 500,
    // BASE_URL: 'http://192.168.2.20:5000/',
    BASE_URL: 'http://localhost:5000/',

    LOGIN: 'api/v1/login',

    SITE_WAREHOUSE: 'api/v1/details/site_warehouse',
    GET_LABOR_TICKETS: 'api/v1/labor/get_labor_tickets',
    GET_WORKORDER_OPERATION_DETAILS: 'api/v1/labor/work_order_operation_details',
    GET_EMPLOYEE_SCAN_DETAILS: 'api/v1/labor/employee_scan_details',

    START_LABOR_TICKET: 'api/v1/labor/create_labor_tickets',
    STOP_LABOR_TICKET: 'api/v1/labor/stop_labor_tickets',
    UPDATE_LABOR_TICKETS: 'api/v1/labor/update_labor_tickets',
};
