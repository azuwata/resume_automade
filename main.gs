var INPUT_SHEET = '入力';
var INPUT_CELL  = 'A1';
var HISTORY_MAX = 15;
var LICENSE_MAX = 10;

function History_generate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inputSheet = ss.getSheetByName(INPUT_SHEET);
  if (!inputSheet) throw new Error('入力シートが見つからない: ' + INPUT_SHEET);

  var raw = String(inputSheet.getRange(INPUT_CELL).getValue() || '').trim();
  if (!raw) throw new Error('入力テキストが空です（入力!A1）');

  var data = parseInputText_(raw);

  setIfExists_(ss, 'name', data.name);
  setIfExists_(ss, 'kana', data.kana);
  setIfExists_(ss, 'address', data.address);
  setIfExists_(ss, 'address_kana', data.address_kana);
  setIfExists_(ss, 'tel', data.tel);

  if (data.birth) {
    var b = parseBirthFlexible_(data.birth);
    var age = calcAge_(b.year, b.month, b.day);
    setIfExists_(ss, 'birth_display', formatBirthDisplay_(b.year, b.month, b.day, age));
  }

  clearHistory_(ss, HISTORY_MAX);
  for (var i = 0; i < Math.min(data.history.length, HISTORY_MAX); i++) {
    var row = data.history[i];
    var idx = pad2_(i + 1);
    setIfExists_(ss, 'history_year_' + idx, row.year);
    setIfExists_(ss, 'history_month_' + idx, row.month);
    setIfExists_(ss, 'history_text_' + idx, row.text);
  }

  clearLicense_(ss, LICENSE_MAX);
  for (var j = 0; j < Math.min(data.license.length, LICENSE_MAX); j++) {
    var r = data.license[j];
    var id = pad2_(j + 1);
    setIfExists_(ss, 'license_year_' + id, r.year);
    setIfExists_(ss, 'license_month_' + id, r.month);
    setIfExists_(ss, 'license_text_' + id, r.text);
  }

  SpreadsheetApp.flush();
}
