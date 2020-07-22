#!/usr/bin/env node
// vim: set ft=javascript:

const program = require('commander');

program
  .version('1.5.0')
  .command('scan [path]', '扫描 React 项目')
  .command('pick', 'react-i18n替换文案')
  .command('export', '导出文案')
  .command('replace', '文本替换文案')
  .command('vue', 'vue-i18n替换文案')
  .parse(process.argv);
