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
  var file = withDocumentLock_(function() {
    var sourceSs = SpreadsheetApp.getActiveSpreadsheet();
    var data = readInputData_(sourceSs);
    var sourceFile = DriveApp.getFileById(sourceSs.getId());
    var parents = sourceFile.getParents();
    var folder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
    var copy = sourceFile.makeCopy('一時_履歴書PDF_' + new Date().getTime(), folder);

    try {
      var copySs = SpreadsheetApp.openById(copy.getId());
      fillResume_(copySs, data);

      var sheet = copySs.getSheetByName(PDF_SHEET_NAME);
      if (!sheet) throw new Error('PDF出力シートが見つからない: ' + PDF_SHEET_NAME);

      var blob = exportSheetToPdf_(copySs.getId(), sheet.getSheetId(), makePdfFileName_(data.name));
      return folder.createFile(blob);
    } finally {
      copy.setTrashed(true);
    }
  });

  SpreadsheetApp.getUi().alert('PDFできた\n' + file.getUrl());
}

function exportSheetToPdf_(id, gid, name) {
  var url = 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=pdf&gid=' + gid + '&size=A4&portrait=true&fitw=true&gridlines=false';
  var token = ScriptApp.getOAuthToken();
  return UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + token }})
    .getBlob().setName(name + '.pdf');
}

function makePdfFileName_(name) {
  var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  return PDF_FILE_PREFIX + (name || '') + '_' + ts;
}
