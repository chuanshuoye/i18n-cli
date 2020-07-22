#!/usr/bin/env node
// vim: set ft=javascript:
const path = require('path');
const sh = require('shelljs');

const config = require('../i18n.config')();

let data = {};
try {
  data = require(path.join(process.cwd(), 'i18n-sources', 'zh-CH.json'));
  targetData = require(path.join(process.cwd(), 'i18n-sources', 'data.json'));
} catch (e) {
  console.log('获取映射文件出错！', e);
  return;
}

function getSource(id) {
  return data.filter(i => i.id === id)[0].source;
}

targetData.forEach(d => {
  const id = d.id;
  console.log(id);
  sources = getSource(id);

  sources.forEach(i => {
    // console.log(i.location);
    sh.sed('-i', d.id, d.defaultMessage, i.location);
  })
});

