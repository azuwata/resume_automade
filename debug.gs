function DEBUG_HistoryParse() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 入力取得
  var sh = ss.getSheetByName('入力');
  if (!sh) { SpreadsheetApp.getUi().alert('入力シート「入力」が無い'); return; }

  var raw = String(sh.getRange('A1').getValue() || '');
  var t = raw.replace(/\r\n/g, '\n');

  // 出力先（デバッグ）シート
  var dbg = ss.getSheetByName('デバッグ') || ss.insertSheet('デバッグ');
  dbg.clear();

  dbg.getRange('A1').setValue('RAW length');
  dbg.getRange('B1').setValue(raw.length);

  dbg.getRange('A2').setValue('Contains header 【学歴職歴】');
  dbg.getRange('B2').setValue(t.indexOf('【学歴職歴】') >= 0);

  // ブロック抽出（3候補）
  var lines = pickBlockLines_(t, '学歴職歴');
  dbg.getRange('A3').setValue('Block title used');
  dbg.getRange('B3').setValue(lines.length ? '学歴職歴' : '');

  if (lines.length === 0) {
    lines = pickBlockLines_(t, '学歴・職歴');
    dbg.getRange('B3').setValue(lines.length ? '学歴・職歴' : dbg.getRange('B3').getValue());
  }
  if (lines.length === 0) {
    lines = pickBlockLines_(t, '学歴職歴（1行=1イベント）');
    dbg.getRange('B3').setValue(lines.length ? '学歴職歴（1行=1イベント）' : dbg.getRange('B3').getValue());
  }

  dbg.getRange('A4').setValue('Block lines count');
  dbg.getRange('B4').setValue(lines.length);

  dbg.getRange('A6').setValue('Line');
  dbg.getRange('B6').setValue('YYYY-MM match?');
  dbg.getRange('C6').setValue('year');
  dbg.getRange('D6').setValue('month');
  dbg.getRange('E6').setValue('rest(text)');

  // 各行を判定（最大30行）
  for (var i = 0; i < Math.min(lines.length, 30); i++) {
    var line = lines[i];

    // 目に見えない全角数字/全角記号の検出にも役立つように、コードポイントも出す
    var parsed = parseHistoryLineSafe_(line);

    dbg.getRange(7 + i, 1).setValue(line);
    dbg.getRange(7 + i, 2).setValue(parsed.ok);
    dbg.getRange(7 + i, 3).setValue(parsed.year);
    dbg.getRange(7 + i, 4).setValue(parsed.month);
    dbg.getRange(7 + i, 5).setValue(parsed.text);
  }

  SpreadsheetApp.getUi().alert('デバッグシートに結果を出力。B4(行数)とB列(match)見てね。');
}

function pickBlockLines_(t, title) {
  var re = new RegExp('【' + escapeReLocal_(title) + '】\\s*\\n([\\s\\S]*?)(?=\\n【|$)', 'm');
  var m = t.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map(function(s){ return String(s).trim(); })
    .filter(function(s){ return s.length > 0; });
}

// 「全角数字・全角ハイフン」を半角に寄せてからパースする安全版
function parseHistoryLineSafe_(line) {
  var s = String(line);

  // 全角数字→半角
  s = s.replace(/[０-９]/g, function(ch){
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  });

  // よくある全角系ハイフンを半角ハイフンに寄せる
  s = s.replace(/[‐-‒–—−ー－]/g, '-');

  // 年月パース（後ろは何でもOK）
  var m = s.match(/^\s*(\d{4})\s*[-\/\.]\s*(\d{1,2})\s*(.*)$/);
  if (!m) return { ok:false, year:'', month:'', text:'' };

  return {
    ok:true,
    year:m[1],
    month: (parseInt(m[2],10) < 10 ? '0' : '') + parseInt(m[2],10),
    text:(m[3] || '').trim()
  };
}

function escapeReLocal_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
