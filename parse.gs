function parseInputText_(raw) {
  var t = String(raw || '').replace(/\r\n/g, '\n');

  function pickLineValue(label) {
    var re = new RegExp('^' + escapeRe_(label) + '\\s*[:：]\\s*(.*)$', 'm');
    var m = t.match(re);
    return m ? m[1].trim() : '';
  }

  var data = {
    name: pickLineValue('氏名'),
    kana: pickLineValue('ふりがな'),
    birth: pickLineValue('生年月日'),
    tel: pickLineValue('電話'),
    address: pickLineValue('住所'),
    address_kana: pickLineValue('ふりがな（住所）'),
    history: [],
    license: []
  };

  var lines = extractBlockLinesByScan_(t, '学歴職歴');
  if (lines.length === 0) lines = extractBlockLinesByScan_(t, '学歴・職歴');
  data.history = lines.map(parseHistoryLine_).filter(Boolean);

  var lic = extractBlockLinesByScan_(t, '免許資格');
  if (lic.length === 0) lic = extractBlockLinesByScan_(t, '免許・資格');
  data.license = lic.map(parseHistoryLine_).filter(Boolean);

  return data;
}

function parseHistoryLine_(line) {
  var s = normalizeZenkaku_(line).trim();
  var m = s.match(/^(\d{4})\s*[-\/\.]\s*(\d{1,2})\s*(.*)$/);
  if (!m) return null;

  return { year: m[1], month: pad2num_(m[2]), text: m[3].trim() };
}

function parseBirthFlexible_(s) {
  var x = normalizeZenkaku_(String(s || '').trim());

  var m1 = x.match(/^(\d{4})\s*[-\/\.]\s*(\d{1,2})\s*[-\/\.]\s*(\d{1,2})$/);
  if (m1) return { year: m1[1], month: pad2num_(m1[2]), day: pad2num_(m1[3]) };

  var m2 = x.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (m2) return { year: m2[1], month: pad2num_(m2[2]), day: pad2num_(m2[3]) };

  return { year:'', month:'', day:'' };
}

function formatBirthDisplay_(y, m, d, age) {
  if (!y) return '';
  return y + ' 年 ' + m + ' 月 ' + d + ' 日生（満 ' + age + ' 歳）';
}

function extractBlockLinesByScan_(t, header) {
  // t は \n に正規化済みの全文
  var lines = t.split('\n');
  var start = -1;

  // header 行を探す（例：【学歴職歴】）
  for (var i = 0; i < lines.length; i++) {
    if (String(lines[i]).trim() === '【' + header + '】') {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return [];

  var out = [];
  for (var j = start; j < lines.length; j++) {
    var s = String(lines[j]).trim();
    if (!s) continue;

    // 次のブロック開始（【...】）が来たら終了
    if (/^【.+】$/.test(s)) break;

    out.push(s);
  }
  return out;
}

