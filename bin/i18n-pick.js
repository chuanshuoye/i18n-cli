#!/usr/bin/env node
// vim: set ft=javascript:

const program = require('commander');
const { version } = require('../package.json');

program
  .version(version)
  .command('scan [ui] [path]', '扫描 React || Vue 项目')
  .command('react', 'React自动注入替换文案')
  .command('vue', 'Vue自动注入替换文案')
  .command('export', '导出文案')
  .command('xlsx', '导出Excel')
  .command('read', '读取Excel')
  .parse(process.argv);
