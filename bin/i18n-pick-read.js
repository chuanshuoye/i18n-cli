#!/usr/bin/env node
// vim: set ft=javascript:

const fs = require('fs');
const XLSX = require('xlsx');
const sh = require('shelljs');
const path = require('path');

const workbook = XLSX.readFile(path.join(process.cwd(), './i18n-sources/SheetJS.xlsx'));

const wsname = workbook.SheetNames[0];
const ws = workbook.Sheets[wsname];         // 取第一个 sheet
const json = XLSX.utils.sheet_to_json(ws);

fs.writeFileSync(path.join(process.cwd(), './i18n-sources/data.json'), JSON.stringify(json, null, 4));

try {
  const data = require(path.join(process.cwd(), './i18n-messages/zh-CH.json'));
  const i18nData = require(path.join(process.cwd(), './i18n-sources/data.json'));

  function getMessage(id) {
    return data.find(i => {
      return i.id === id;
    })
  }

  const repData = i18nData.map(i => {
    const id = i.id;
    i.source = getMessage(id).source;
    return i;
  })

  fs.writeFileSync(path.join(process.cwd(), './i18n-sources/zh-CH.json'), JSON.stringify(repData, null, 4));
  sh.cp('-r', path.join(process.cwd(), './i18n-sources/zh-CH.json'), path.join(process.cwd(), './i18n-messages/zh-CH.json'))

} catch (e) {
  console.error(e);
}


