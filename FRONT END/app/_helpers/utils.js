import { ExportToCsv } from 'export-to-csv';
import { appConstants } from '../_helpers/consts';

export const utils = {
  convertTimeStampToString,
  convertStringToTime,
  toCurrency,
  duration,
  total,
  exportCSV,
  statusArray,
  getDistinctFilters,
  getStatusbyValue,
  updateStatusParcelID, 
  getCategorybyValue

}

function convertTimeStampToString(timeStamp) {
  if (timeStamp) {
    var date = new Date(timeStamp);
    return date.toLocaleDateString(date, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  } else {
    return ''
  }
}

function convertStringToTime(timeStamp) {
  var date = new Date();
  var hours = timeStamp.substring(11, 13);
  var minutes = timeStamp.substring(14, 16);

  date.setHours(+hours);
  date.setMinutes(+minutes);

  return formatAMPM(date);
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function toCurrency(amount) {
  if (amount != null && amount > 0)
    return '$' + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  else
    null
}

function duration(timeStamp) {

  var hours = timeStamp.substring(12, 13) * 60;
  var minutes = timeStamp.substring(14, 16);

  var total = ((parseInt(hours) + parseInt(minutes)) / 60).toFixed(2);


  return (total)
}

function total(array) {
  var total = 0;
  for (var i = 0; i < array.length; i++) {
    total += array[i].RUN_HRS;

  }
  return total.toFixed(2);

}

function statusArray() {
  return [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Pending' },
    { value: 3, label: 'Pending Redemption' },
    { value: 4, label: 'Partial Redemption' },
    { value: 5, label: 'Redeemed' },
    { value: 6, label: 'Refunded' },
    { value: 7, label: 'Foreclosure' },
    { value: 8, label: 'Bankruptcy' },
    { value: 9, label: 'Write-off' },
    { value: 10, label: 'REO' },

  ]
}

function getStatusbyValue(value) {
  var status = statusArray();
  for (var i = 0; i < status.length; i++) {
    if (status[i].value === value) {
      return status[i].label;
    }
  }
}

function exportCSV(array) {
  const options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Data Export',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  };

  const csvExporter = new ExportToCsv(options);

  return csvExporter.generateCsv(array);
}

function getDistinctFilters() {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.GET_DISTINCT_FILTERS);
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'x-access-token': localStorage.getItem('token')
    },
  })
    .then((res) => {
      if (res.status === 200) {
        response_status = 200;
        return res.json();
      }
      else {
        response_status = 400;
        return res.json();
      }
    })
    .then((data) => {
      if (response_status === 200) {
        return data
      } else {
        alert(data.message);
        return null;
      }
    })
    .catch((err) => console.error(err));
}

function updateStatusParcelID(parcel_id, status){
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.UPDATE_STATUS_PARCEL_ID).concat(parcel_id).concat('/').concat(status);
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'x-access-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      PARCEL_ID: parcel_id,
      STATUS: status
    })
  })
    .then((res) => {
      if (res.status === 200) {
        response_status = 200;
        return res.json();
      }
      else {
        response_status = 400;
        return res.json();
      }
    })
    .then((data) => {
      if (response_status === 200) {
        alert(data.message);
      } else {
        alert(data.message);
        return null;
      }
    })
    .catch((err) => console.error(err));
}

function categoryArray() {
  return [
    { value: 1, label: 'Beginning Balance' },
    { value: 2, label: 'Premium' },
    { value: 3, label: 'Subsequent Tax' },
    { value: 4, label: 'Attorney Fees' },
    { value: 5, label: 'Certificate Fees' },
    { value: 6, label: 'Filling Fees' },
    { value: 7, label: 'Processing Fees' },
    { value: 8, label: 'Recording Fees' },
    { value: 9, label: 'Refunds' },
    { value: 10, label: 'TDA Fees' },
  ]
}

function getCategorybyValue(value) {
  var category = categoryArray();
  for (var i = 0; i < category.length; i++) {
    if (category[i].value === value) {
      return category[i].label;
    }
  }
}