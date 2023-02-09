import React from "react";
import { DataSheetGrid, dateColumn, textColumn, keyColumn, floatColumn, checkboxColumn, CellProps } from 'react-datasheet-grid'

export const upload_parcel_columns = [
    {
        ...keyColumn('MANAGING_COMPANY', textColumn),
        title: 'Managing Company',
    },
    {
        ...keyColumn('CERTIFICATE', textColumn),
        title: 'Certificate',
    },
    {
        ...keyColumn('INVESTMENT_DATE', dateColumn),
        title: 'Investment Date',
    },
    {
        ...keyColumn('ORIGINAL_LIEN_AMOUNT', floatColumn),
        title: 'Original Lien Amount',
    },
    {
        ...keyColumn('ORIGINAL_LIEN_INTEREST', floatColumn),
        title: 'Original Lien Interest',
    },

    {
        ...keyColumn('ORIGINAL_LIEN_EFFECTIVE_DATE', dateColumn),
        title: 'Original Lien Effective Date',
    },
    {
        ...keyColumn('ORIGINAL_LIEN_INTERVAL', textColumn),
        title: 'Original Lien Interval',
    },
    {
        ...keyColumn('PREMIUM_AMOUNT', floatColumn),
        title: 'Premium Amount',
    },
    {
        ...keyColumn('PREMIUM_INTEREST', floatColumn),
        title: 'Premium Interest',
    },
    {
        ...keyColumn('PREMIUM_EFFECTIVE_DATE', dateColumn),
        title: 'Premium Effective Date',
    },
    {
        ...keyColumn('PREMIUM_INTERVAL', textColumn),
        title: 'Premium Interval',
    },

    {
        ...keyColumn('TSRID', textColumn),
        title: 'TSRID',
    },
    {
        ...keyColumn('STATE', textColumn),
        title: 'State',
    },
    {
        ...keyColumn('COUNTY', textColumn),
        title: 'County',
    },
    {
        ...keyColumn('MUNICIPALITY', textColumn),
        title: 'Municipality',
    },
    {
        ...keyColumn('PARCEL_ID', textColumn),
        title: 'Parcel ID',
    },
    {
        ...keyColumn('TAX_ID', textColumn),
        title: 'Tax ID',
    },

    {
        ...keyColumn('OWNER_NAME_CURRENT_OWNER', textColumn),
        title: 'Owner Name',
    },
    {
        ...keyColumn('OWNER_ADDRESS', textColumn),
        title: 'Owner Address',
    },
    {
        ...keyColumn('OWNER_CITY_STATE_ZIP', textColumn),
        title: 'Owner City State Zip',
    },
    {
        ...keyColumn('HOMESTEAD_EXEMPTION', textColumn),
        title: 'Homestead Exemption',
    },
    {
        ...keyColumn('TOTAL_ASSESSED_VALUE', textColumn),
        title: 'Total Assessed Value',
    },
    {
        ...keyColumn('TOTAL_MARKET_VALUE', textColumn),
        title: 'Total Market Value',
    },

    {
        ...keyColumn('APN', textColumn),
        title: 'APN',
    },
    {
        ...keyColumn('LOCATION_FULL_STREET_ADDRESS', textColumn),
        title: 'Location Full Street Address',
    },
    {
        ...keyColumn('LOCATION_CITY', textColumn),
        title: 'Location City',
    },
    {
        ...keyColumn('LOCATION_ZIP', textColumn),
        title: 'Location Zip',
    },
    {
        ...keyColumn('LONGITUDE', textColumn),
        title: 'Longitude',
    },
    {
        ...keyColumn('LATITUDE', textColumn),
        title: 'Latitude',
    },

    {
        ...keyColumn('OWNER_OCCUPIED', textColumn),
        title: 'Owner Occupied',
    },
    {
        ...keyColumn('COUNTY_LAND_USE', textColumn),
        title: 'County Land Use',
    },
    {
        ...keyColumn('COUNTY_LAND_USE_DESC', textColumn),
        title: 'County Land Use Desc',
    },
    {
        ...keyColumn('STANDARDIZED_LAND_USE', textColumn),
        title: 'Standardized Land Use',
    },
    {
        ...keyColumn('STANDARDIZED_LAND_USE_DESC_PROPERTY_TYPE', textColumn),
        title: 'Standardized Land Use Desc Property Type',
    },
    {
        ...keyColumn('LOT_SIZE', textColumn),
        title: 'Lot Size',
    },

    {
        ...keyColumn('LOT_SIZE_UNIT', textColumn),
        title: 'Lot Size Unit',
    },
    {
        ...keyColumn('ZONING', textColumn),
        title: 'Zoning',
    },
    {
        ...keyColumn('BUILDING_CLASS', textColumn),
        title: 'Building Class',
    },
    {
        ...keyColumn('YEAR_BUILT', textColumn),
        title: 'Year Built',
    },
    {
        ...keyColumn('NO_OF_STORIES', textColumn),
        title: 'No Of Stories',
    },
    {
        ...keyColumn('NO_OF_UNITS', textColumn),
        title: 'No Of Units',
    },

    {
        ...keyColumn('ASSESSMENT_YEAR', textColumn),
        title: 'Assessment Year',
    },
    {
        ...keyColumn('LATEST_SALE_DATE', dateColumn),
        title: 'Latest Sale Date',
    },
    {
        ...keyColumn('LATEST_SALE_PRICE', textColumn),
        title: 'Latest Sale Price',
    },
    {
        ...keyColumn('LATEST_ARMS_LENGTH_SALE_DATE', dateColumn),
        title: 'Latest Arms Length Sale Date',
    },
    {
        ...keyColumn('LATEST_ARMS_LENGTH_SALE_PRICE', textColumn),
        title: 'Latest Arms Length Sale Price',
    },
    {
        ...keyColumn('PRIOR_ARMS_LENGTH_SALE_DATE', textColumn),
        title: 'Prior Arms Length Sale Date',
    },

    {
        ...keyColumn('PRIOR_ARMS_LENGTH_SALE_PRICE', textColumn),
        title: 'Prior Arms Length Sale Price',
    },
    {
        ...keyColumn('LOAN1_AMOUNT', textColumn),
        title: 'Loan1 Amount',
    },
    {
        ...keyColumn('LOAN1_DUE_DATE', dateColumn),
        title: 'Loan1 Due Date',
    },
    {
        ...keyColumn('LOAN1_TYPE', textColumn),
        title: 'Loan1 Type',
    },
    {
        ...keyColumn('LOAN2_AMOUNT', textColumn),
        title: 'Loan2 Amount',
    },
    {
        ...keyColumn('LEGAL_CITY', textColumn),
        title: 'Legal City',
    },

    {
        ...keyColumn('LEGAL_BLOCK', textColumn),
        title: 'Legal Block',
    },
    {
        ...keyColumn('LEGAL_LOT_NUMBER', textColumn),
        title: 'Legal Lot Number',
    },
    {
        ...keyColumn('QUALIFIER', textColumn),
        title: 'Qualifier',
    },
    {
        ...keyColumn('LEGAL_SECTION', textColumn),
        title: 'Legal Section',
    },
    {
        ...keyColumn('LEGAL_UNIT', textColumn),
        title: 'Legal Unit',
    },
    {
        ...keyColumn('LEGAL_SUBDIVISION_NAME', textColumn),
        title: 'Legal Subdivision Name',
    },

    {
        ...keyColumn('LEGAL_TRACT_NUMBER', textColumn),
        title: 'Legal Tract Number',
    },
    {
        ...keyColumn('LEGAL_SECTION_TOWNSHIP_RANGE_MERIDIAN', textColumn),
        title: 'Legal Section Township Range Meridian',
    },
    {
        ...keyColumn('LEGAL_BRIEF_DESC', textColumn),
        title: 'Legal Brief Desc',
    },
    {
        ...keyColumn('SUBJECT_FOUND_COUNT', textColumn),
        title: 'Subject Found Count',
    },
    {
        ...keyColumn('ENV_RISK', textColumn),
        title: 'Env Risk',
    },
    {
        ...keyColumn('TAG_KEEP_MAYBE_REMOVE_VIEWED', textColumn),
        title: 'Tag Keep Maybe Remove Viewed',
    },

    {
        ...keyColumn('GRADE_A_B_C_D_F', textColumn),
        title: 'Grade A B C D F',
    },
    {
        ...keyColumn('GROUP_1_2_3_4_5', textColumn),
        title: 'Group 1 2 3 4 5',
    },
    {
        ...keyColumn('NOTES', textColumn),
        title: 'Notes',
    }



]