function setIfExists_(ss, name, value) {
  var r;
  try { r = ss.getRangeByName(name); } catch(e) { return; }
  if (!r) return;
  r.setValue(value || '');
}

function clearHistory_(ss, max) {
  for (var i = 1; i <= max; i++) {
    var id = pad2_(i);
    setIfExists_(ss, 'history_year_' + id, '');
    setIfExists_(ss, 'history_month_' + id, '');
    setIfExists_(ss, 'history_text_' + id, '');
  }
}

function clearLicense_(ss, max) {
  for (var i = 1; i <= max; i++) {
    var id = pad2_(i);
    setIfExists_(ss, 'license_year_' + id, '');
    setIfExists_(ss, 'license_month_' + id, '');
    setIfExists_(ss, 'license_text_' + id, '');
  }
}

function normalizeZenkaku_(s) {
  s = String(s || '');
  s = s.replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  s = s.replace(/[‐-‒–—−ー－]/g, '-');
  return s;
}

function calcAge_(y, m, d) {
  if (!y) return '';
  var now = new Date();
  var age = now.getFullYear() - parseInt(y,10);
  var b = new Date(now.getFullYear(), parseInt(m,10)-1, parseInt(d,10));
  if (now < b) age--;
  return age;
}

function isValidDate_(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  var date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function withDocumentLock_(callback) {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) {
    throw new Error('別の生成処理が実行中です。少し待ってから再実行してください。');
  }
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function pad2_(n){ return (n<10?'0':'')+n; }
function pad2num_(s){ return pad2_(parseInt(s,10)); }
function escapeRe_(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
