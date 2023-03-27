export const appConstants = {
    SEARCH_DELAY_MS: 500,
    BASE_URL: 'http://3.138.106.64:5000/',
    // BASE_URL: 'http://localhost:5000/',

    REGISTER: 'api/v1/register',
    LOGIN: 'api/v1/login',

    UPLOAD_PARCELS: 'api/v1/upload_parcels',
    EDIT_BULK_PARCELS: 'api/v1/edit_bulk_parcels',
    SEARCH_PARCEL: 'api/v1/search_parcels?searchString=',
    GET_DISTINCT_FILTERS: 'api/v1/get_distinct_filters',
    GET_PARCELS_BASED_ON_FILTERS: 'api/v1/get_parcels_based_on_filters?',

    GET_PARCEL_DETAILS: 'api/v1/parcel/',
    UPDATE_STATUS_PARCEL_ID: 'api/v1/parcel/',

    UPDATE_FEE_BY_ID: 'api/v1/parcel/update_fee',
    DELETE_FEE_BY_ID: 'api/v1/parcel/delete_fee/',

    ADD_FEE_BY_UNIQUE_ID: 'api/v1/parcel/add_fee',

    GET_PAYOFF_REPORT: 'api/v1/parcel/',

    ADD_NEW_NOTE: 'api/v1/notes/add/',
    DELETE_NOTE_BY_ID: 'api/v1/notes/delete/',

    REDEEM_OR_PARTIAL_REDEEM_OR_ADD_PAYMENT: '/api/v1/parcel/redeem/',
    DELETE_PAYMENT_BY_ID: 'api/v1/parcel/delete_payment/',

    ADD_NEW_DOCUMENT: 'api/v1/document/add/',
    DELETE_DOCUMENT_BY_ID: 'api/v1/document/delete/',

    GET_AUDIT_HISTORY: 'api/v1/audit/',

    GET_ALL_FIELDS_REPORT: 'api/v1/reports/all_fields',
    GET_FEE_DETAILS_REPORT: 'api/v1/reports/fee_details',
    GET_SUB_REQUEST_FORM_REPORT: 'api/v1/reports/sub_request_form',
    GET_WEEKLY_REPORT: 'api/v1/reports/weekly_report',
    GET_NEW_PENDING_REDEMPTION_NOTICE: 'api/v1/reports/new_pending_redemeption_notice',
    GET_WSFS_REDEMPTION_NOTIFICATION: 'api/v1/reports/wsfs_redemption_notification',
    GET_MUNI_SPECIFIC_QUERY_FOR_SUBS: 'api/v1/reports/municipality_specific_query_for_subs',
    GET_WSFS_NEW_LIEN_EXPORT_TEMPLATE: 'api/v1/reports/wsfs_new_lien_export_template',
};
