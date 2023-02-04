import { min } from "lodash";
import { ExportToCsv } from 'export-to-csv';

export const utils = {
  convertTimeStampToString,
  convertStringToTime,
  toCurrency,
  duration,
  total,
  exportCSV,

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

function exportCSV(array) {
  const options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Sales RFQ',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  };

  const csvExporter = new ExportToCsv(options);

  return csvExporter.generateCsv(array);
}

