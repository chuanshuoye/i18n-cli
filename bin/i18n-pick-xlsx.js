#!/usr/bin/env node
// vim: set ft=javascript:

const path = require('path');
const XLSX = require('xlsx');
const locales = require(path.join(process.cwd(), './i18n-messages/zh-CH.json'));
const config = require('../i18n.config')();

const result = locales.map(i => {
  return {
    'id': i.id,
    'defaultMessage': '',
    'key': config.setKey ? config.setKey(i) : ''
  }
});

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(result);


XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
// console.log(wb)
XLSX.writeFile(wb, path.join(process.cwd(), './i18n-sources/SheetJS.xlsx'))
