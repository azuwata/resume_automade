# Resume Auto Generator (Google Apps Script)

Googleスプレッドシート上で動作する  
履歴書自動生成ツールです。

入力テキストをパースし、履歴書テンプレートへ自動反映。

---

## ✨ Features

- 入力テキスト（A1）を自動解析
- 学歴・職歴・免許資格を自動整形
- 生年月日を整形表示（満年齢自動計算）
- 全角数字・ハイフン揺れ対応
- 名前付き範囲への自動流し込み
- 元スプレッドシートを変更せずにPDF生成（非破壊設計）

---

## 🧩 Architecture
- main : orchestration layer（制御）
- parser : input parsing & normalization（解析）
- util : shared utilities（共通処理）
- pdf : non-destructive PDF export pipeline（PDF生成）

### main.gs
- `History_generate()`：テンプレへデータ流し込み
- `fillResume_()`：指定Spreadsheetへ反映

### parser.gs
- `parseInputText_()`
- `parseHistoryLine_()`
- `extractBlockLinesByScan_()`
- `parseBirthFlexible_()`
- `formatBirthDisplay_()`

### util.gs
- 全角→半角正規化
- 日付処理
- 年齢計算
- 名前付き範囲操作
- 履歴クリア処理

### pdf.gs
- 元ファイルをコピー
- コピー側にデータ流し込み
- PDFエクスポート
- 一時コピー削除（任意）

---

## 📝 Input Format (A1)
- 【基本】
- 氏名：山田 太郎
- ふりがな：やまだ たろう
- 生年月日：1990-04-12
- 電話：090-0000-0000
- 住所：東京都〇〇
- ふりがな（住所）：とうきょうと〇〇

- 【学歴職歴】
- 2010-04　〇〇高校 入学
- 2013-03　〇〇高校 卒業
- 2017-04　株式会社〇〇 入社
- 2020-10　株式会社〇〇 退社

- 【免許資格】
- 2011-07　中型自動車免許取得


### Supported Date Formats

- `YYYY-MM`
- `YYYY/MM`
- `YYYY.MM`
- `YYYY年M月`
- 全角数字対応
- ハイフン揺れ対応

---

## 📄 PDF Generation

メニュー:履歴書 → PDF生成（元は変更しない）


### Behavior

- 元スプレッドシートは変更しない
- Drive上に一時コピーを作成
- コピー側にデータ流し込み
- PDF化
- 一時コピー削除可能

---

## ⚙️ Required Setup

履歴書テンプレ側に以下の「名前付き範囲」を定義する必要があります。

例：

- `name`
- `kana`
- `birth_display`
- `history_year_01` ～ `history_year_15`
- `history_month_01` ～ `history_month_15`
- `history_text_01` ～ `history_text_15`
- `license_year_01` ～ `license_year_10`
- `license_month_01` ～ `license_month_10`
- `license_text_01` ～ `license_text_10`

---

## 🔐 Permissions

初回実行時に以下の権限を要求します：

- Google Drive アクセス（コピー・PDF保存）
- UrlFetchApp（PDFエクスポート）

---

## 🏗 Design Principles

- 単一責任分離（main / parser / util / pdf）
- 元データ非破壊設計
- 入力揺れに強いパーサー
- 再利用可能な構造
- メンテナンスしやすい設計

---

## 🚀 Future Improvements

- Googleフォーム連携
- CSV一括生成
- 保存先フォルダ指定
- Webアプリ化
- 複数テンプレ対応

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## About

This project was originally built as a personal productivity tool
to automate resume generation and PDF export workflows.

It is now open-sourced for educational and practical use.
