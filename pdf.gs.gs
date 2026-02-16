var PDF_SHEET_NAME = '履歴書';
var PDF_FILE_PREFIX = '履歴書_';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('履歴書')
    .addItem('生成', 'History_generate')
    .addItem('生成してPDF保存', 'GenerateAndExportPDF')
    .addToUi();
}

function GenerateAndExportPDF() {
  History_generate();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PDF_SHEET_NAME);
  var blob = exportSheetToPdf_(ss.getId(), sheet.getSheetId(), makePdfFileName_());

  var folder = DriveApp.getFileById(ss.getId()).getParents().next();
  var file = folder.createFile(blob);

  SpreadsheetApp.getUi().alert('PDFできた\n' + file.getUrl());
}

function exportSheetToPdf_(id, gid, name) {
  var url = 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=pdf&gid=' + gid + '&size=A4&portrait=true&fitw=true&gridlines=false';
  var token = ScriptApp.getOAuthToken();
  return UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + token }})
    .getBlob().setName(name + '.pdf');
}

function makePdfFileName_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var n = ss.getRangeByName('name');
  var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  return PDF_FILE_PREFIX + (n ? n.getValue() : '') + '_' + ts;
}
