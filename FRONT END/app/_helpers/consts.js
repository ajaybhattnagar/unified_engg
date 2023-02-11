export const appConstants = {
    SEARCH_DELAY_MS: 500,
    // BASE_URL: 'http://13.38.228.205:5000/',
    BASE_URL: 'http://localhost:5000/',

    REGISTER: 'api/v1/register',
    LOGIN: 'api/v1/login',

    UPLOAD_PARCELS: 'api/v1/upload_parcels',
    SEARCH_PARCEL: 'api/v1/search_parcels?searchString=',
    GET_DISTINCT_FILTERS: 'api/v1/get_distinct_filters',
    GET_PARCELS_BASED_ON_FILTERS: 'api/v1/get_parcels_based_on_filters?',

    GET_PARCEL_DETAILS: 'api/v1/parcel/',
    UPDATE_STATUS_PARCEL_ID: 'api/v1/parcel/',

    UPDATE_FEE_BY_ID: 'api/v1/parcel/update_fee',
    DELETE_FEE_BY_ID: 'api/v1/parcel/delete_fee/',

    ADD_FEE_BY_UNIQUE_ID: 'api/v1/parcel/add_fee',

    GET_PAYOFF_REPORT: 'api/v1/parcel/',
};
