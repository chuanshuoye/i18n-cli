#!/usr/bin/env node
// vim: set ft=javascript:

const fs = require('fs');
const path = require('path');
const config = require('../i18n.config')();

const dir = config.targetDir;
const getKey = config.getKey;

const targetPath = `${dir}/zh_CN.js`;
const srcPath = path.join(process.cwd(), dir, 'zh-CH.json');
let data = [];
try {
  data = require(srcPath);
} catch (e) {
  console.log('获取映射文件出错！', e);
  return;
}
const result = {};
// const result = [];
data.forEach(d => {
  if (result[d.id]) return console.log(`"${d.defaultMessage}"与"${result[d.id]}" key 值相同，请修改！`);
  result[getKey ? getKey(d) : d.id] = d.defaultMessage;
});
// DONE: 重写 targetPath 文件
fs.writeFile(targetPath, JSON.stringify(result, null, '\t'), function (err) {
  if (err) return console.error(err);
  console.log('----导出到 zh_CN.js ----')
})
