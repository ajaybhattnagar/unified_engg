import { ExportToCsv } from 'export-to-csv';
import { appConstants } from '../_helpers/consts';
import * as XLSX from 'xlsx';
import { json } from 'react-router-dom';


export const utils = {
  convertTimeStampToString,
  convertStringToTime,
  toCurrency,
  duration,
  total,
  exportCSV,
  exportExcel,
  getLaborTickets,
  getStatusbyValue,
  convertTimeStampToDateForInputBox,
  reportsArray,

  stopLaborTickets,
  updateLaborTickets,
  updateLaborTicketsField,
  uploadDocuments,
  uploadImage,
  tranactionIdUrlLink,

  decodeJwt,
  open_document,

  clock_in_out_users,

  calcHoursWorked,
  disectScanInputString,

  dateDiffDays,
}



function convertTimeStampToString(timeStamp) {
  if (timeStamp) {
    var date = new Date(timeStamp);
    // return date.toLocaleDateString(date, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
    date = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    // var isoString = date.toISOString();
    var formattedString = date.replace('T', ' ').replace('Z', '');
    return formattedString;
  } else {
    return ''
  }
}

function convertStringToTime(timeStamp) {
  //  convert to local date and 12 hour format

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
  if (amount != null) {
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

function reportsArray() {
  return [
    { value: 'ALL_FIELDS', label: 'All Fields' },
    { value: 'FEE_DETAILS', label: 'Fee Detail Report' },
    { value: 'SUB_REQUEST_FORM', label: 'Sub Request Form' },
    { value: 'WEEKLY_REPORT', label: 'Weekly Report' },
    { value: 'PENDING_REDEMPTION_NOTICE', label: 'New Pending Redemption Notice' },
    { value: 'WSFS_REDEMPTION_NOTIFICATION', label: 'WSFS Redemption Notification' },
    { value: 'MUNI_QUERY_FOR_SUBS', label: 'Municipality Specific Query For Subs' },
    { value: 'WSFS_NEW_LIEN_EXPORT_TEMPLATE', label: 'WSFS New Lien Export Template' },
    { value: 'REDEMPTION_REPORT', label: 'Redemption Report' },
    { value: 'WSFS_LTVL_STATUS', label: 'WSFS LTVL Status Report' },

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

function replaceNullsWithEmptyStrings(arrayOfObjects) {
  const newArray = arrayOfObjects.map(obj => {
    const newObj = {};
    for (let key in obj) {
      if (obj[key] === null) {
        newObj[key] = '';
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  });
  return newArray;
}

function exportCSV(array, fileName) {
  let d = new Date();
  let dformat = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}-${d.getHours()}-${d.getMinutes()}`;
  let file_name = fileName + ' - ' + dformat;

  const options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    filename: file_name,
  };

  // console.log(replaceNullsWithEmptyStrings(array))
  const csvExporter = new ExportToCsv(options);

  return csvExporter.generateCsv(replaceNullsWithEmptyStrings(array));
}

function exportExcel(array, fileName) {
  let d = new Date().toLocaleDateString();
  let month = d.split('/')[0];
  let day = d.split('/')[1];
  let year = d.split('/')[2];
  let dformat = `${month}-${day}-${year}-${new Date().getHours()}-${new Date().getMinutes()}`;
  let file_name = fileName + ' - ' + dformat;
  const worksheet = XLSX.utils.json_to_sheet(array);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PARCELS");
  XLSX.writeFile(workbook, file_name + '.xlsx');
}

function getLaborTickets(from_date, to_date, employee_id, approved) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.GET_LABOR_TICKETS);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'x-access-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      "TO_DATE": to_date,
      "FROM_DATE": from_date,
      "EMPLOYEE_ID": employee_id,
      "APPROVED": approved
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
        return data
      } else {
        alert(data.message);
        return null;
      }
    })
    .catch((err) => console.error(err));
}

function stopLaborTickets(transactionId, clockInTime) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.STOP_LABOR_TICKET);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'x-access-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      "TRANSACTION_ID": transactionId,
      "CLOCK_IN_TIME": new Date(clockInTime),
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
        // Clear local storage
        localStorage.removeItem("ACTIVE_WO_CLOCK_IN");
        localStorage.removeItem("ACTIVE_WO");
        localStorage.removeItem("ACTIVE_OP");
        localStorage.removeItem("INDIRECT_ID");
        return data
      } else {
        alert(data.message);
        return null;
      }
    })
    .catch((err) => console.error(err));
}

function updateLaborTickets(data) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.UPDATE_LABOR_TICKETS);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'x-access-token': localStorage.getItem('token')
    },
    body: JSON.stringify(data)
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
    .catch((err) => console.error(err)); G
}

function updateLaborTicketsField(transaction_id, field, value) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.UPDATE_LABOR_TICKET_FIELD).concat(field);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'x-access-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      "TRANSACTION_ID": transaction_id,
      "FIELD": field,
      "VALUE": value
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
        return data
      } else {
        alert(data.message);
        return null;
      }
    })
    .catch((err) => console.error(err)); G
}

function uploadDocuments(data, tranaction_id, anyDocument = true) {
  var response_status = 0;

  if (anyDocument) {
    var url = appConstants.BASE_URL.concat(appConstants.UPLOAD_DOCUMENTS).concat('/').concat(tranaction_id);
  }
  else {
    var url = appConstants.BASE_URL.concat(appConstants.UPLOAD_DOCUMENTS_LABOR).concat('/').concat(tranaction_id);
  }
  const request_object = {
    method: "POST",
    headers: {
      'x-access-token': localStorage.getItem('token')
    },
    body: data
  }
  return fetch(url, request_object)
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

function uploadImage(data, tranaction_id, anyDocument = true) {
  var response_status = 0;

  if (anyDocument) {
    var url = appConstants.BASE_URL.concat(appConstants.UPLOAD_IMAGES).concat('/').concat(tranaction_id);
  }
  else {
    var url = appConstants.BASE_URL.concat(appConstants.UPLOAD_IMAGES_LABOR).concat('/').concat(tranaction_id);
  }

  const request_object = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token')
    },
    body: JSON.stringify({ 'CLICKED_IMAGE': data }),

  }
  return fetch(url, request_object)
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



function convertTimeStampToDateForInputBox(timeStamp) {
  if (timeStamp) {
    var date = new Date(timeStamp);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

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
    // return month + '/' + dt + '/' + year;
  } else {
    return ''
  }

}

function decodeJwt() {
  if (localStorage.getItem('token')) {
    var token = localStorage.getItem('token');
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  } else {
    return null;
  }
}

function open_document(path) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem("token") },
    body: JSON.stringify({ FILE_PATH: path })
  };
  fetch(appConstants.BASE_URL.concat(appConstants.GET_DOCUMENTS_WITH_PATH), requestOptions)
    .then(res => res.blob())
    .then((blob) => {
      var file = window.URL.createObjectURL(blob);
      window.open(file, "_blank")
    })
    .catch(error => {
      alert(error)
      console.log(error)
    })
}

function clock_in_out_users(type) {
  var response_status = 0;
  var url = appConstants.BASE_URL.concat(appConstants.CLOCK_IN_OUT_USER).concat(type);
  const request_object = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token')
    },

  }
  return fetch(url, request_object)
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

function calcHoursWorked(clock_in, clock_out) {
  var total_hours = 0;
  if (clock_in && clock_out) {
    var clock_in_date = new Date(clock_in);
    var clock_out_date = new Date(clock_out);
    var diff = (clock_out_date.getTime() - clock_in_date.getTime());

    // Round to the nearest quatrer hour
    diff = Math.floor(diff / (1000 * 60));
    total_hours = Math.ceil(diff / 15) * 15;
  }
  return total_hours;
}

function tranactionIdUrlLink(transaction_id) {
  if (transaction_id == "" || transaction_id == null) {
    return '';
  }
  var url = appConstants.DEPLOYEMENT_URL.concat('ticket_details?transaction_type=labor_ticket&transaction_id=').concat(transaction_id);
  url = `<a href="${url}" target='_blank2'>${transaction_id}</a>`;
  return url;
}

function disectScanInputString(string) {
  try {
    var input = string
    input = input.replace('*', '')
    input = input.replace('*', '')
    input = input.slice(1, -1);
    var result = input.split('$')
    var wo = result[0]
    var sub_id = result[1]
    var operation_seq = result[2].replace('*', '')
    var arr = {
      original_string: string,
      work_order: wo,
      sub_id: sub_id,
      operation_seq: operation_seq
    }
    return arr
  } catch (error) {
    alert("Invalid Input")
    console.log(error)
  }
}

function dateDiffDays (date1, date2) {
  const dt1 = new Date(date1);
  const dt2 = new Date(date2);
  return Math.floor(
    (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
      Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
      (1000 * 60 * 60 * 24)
  );
};

