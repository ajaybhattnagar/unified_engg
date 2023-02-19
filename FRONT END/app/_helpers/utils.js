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
  getCategorybyValue,
  categoryArray,
  convertTimeStampToDateForInputBox,
  delteFeeByID,
  delteNoteByID,
  deltePaymentByID

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
  if (amount != null && amount > 0) {
    amount = parseFloat(amount).toFixed(2)
    return '$' + (amount).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
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
    { value: 4, label: 'Refunded' },
    { value: 5, label: 'Foreclosure' },
    { value: 6, label: 'Bankruptcy' },
    { value: 7, label: 'Write-off' },
    { value: 8, label: 'REO' },
    { value: 9, label: 'Partial Redemption', disabled: true },
    { value: 10, label: 'Redeemed', disabled: true },

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

function updateStatusParcelID(parcel_id, status, old_status) {
  var confirm_string = '';
  if (old_status < 9){
    confirm_string = 'Are you sure you want to update the status?';
  }
  if (old_status > 8){
    confirm_string = 'Parcel is already redeemed. Are you sure you want to update the status?';
  } else {
    confirm_string = 'Are you sure you want to update the status?';
  }
  
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.UPDATE_STATUS_PARCEL_ID).concat(parcel_id).concat('/').concat(status);
  if (confirm(confirm_string)) {
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
          window.location.reload();
        } else {
          alert(data.message);
          return null;
        }
      })
      .catch((err) => console.error(err));
  } else {
    // Do nothing!
    console.log('Cancelled by user!');
  }
}

function categoryArray(filter_value) {
  filter_value = parseInt(filter_value) || 999;
  var arr = [
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
    { value: 101, label: 'Redeemable' },
    { value: 102, label: 'Non-Redeemable' },
    { value: 103, label: 'Refunds' },
    { value: 104, label: 'Payments' },
    { value: 105, label: 'Deducted' },
    { value: 106, label: 'Total' },
  ]
  arr = arr.filter((item) => item.value < filter_value);
  return arr;
}

function getCategorybyValue(value) {
  var category = categoryArray();
  for (var i = 0; i < category.length; i++) {
    if (category[i].value === value) {
      return category[i].label;
    }
  }
}

function convertTimeStampToDateForInputBox(timeStamp) {
  if (timeStamp) {
    var date = new Date(timeStamp);
    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }

    var dt = date.getDate();
    if (dt < 10) {
      dt = '0' + dt;
    }
    return year + '-' + month + '-' + dt;
  } else {
    return ''
  }

}

function delteFeeByID(id) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.DELETE_FEE_BY_ID).concat(id);
  if (confirm('Are you sure you want to delete the fee?')) {
    return fetch(url, {
      method: "DELETE",
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
          window.location.reload();
          alert(data.message);
        } else {
          alert(data.message);
          return null;
        }
      })
      .catch((err) => console.error(err));
  } else {
    // Do nothing!
    console.log('Cancelled by user!');
  }


}

function delteNoteByID(id) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.DELETE_NOTE_BY_ID).concat(id);
  if (confirm('Are you sure you want to delete the fee?')) {
    return fetch(url, {
      method: "DELETE",
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
          window.location.reload();
          alert(data.message);
        } else {
          alert(data.message);
          return null;
        }
      })
      .catch((err) => console.error(err));
  } else {
    // Do nothing!
    console.log('Cancelled by user!');
  }


}

function deltePaymentByID(id) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.DELETE_PAYMENT_BY_ID).concat(id);
  if (confirm('Are you sure you want to delete the payment?')) {
    return fetch(url, {
      method: "DELETE",
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
          window.location.reload();
          alert(data.message);
        } else {
          alert(data.message);
          return null;
        }
      })
      .catch((err) => console.error(err));
  } else {
    // Do nothing!
    console.log('Cancelled by user!');
  }
}