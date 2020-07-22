const XLSX = require('xlsx');
const locales = require('../i18n-messages/zh-CH.json');

const result = locales.map(i => {
  return {
    'id': i.id,
    'defaultMessage': ''
  }
});
console.log(result);

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(result);


XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
// console.log(wb)
XLSX.writeFile(wb, './i18n-sources/SheetJS.xlsx')
