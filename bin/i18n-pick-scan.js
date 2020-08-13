#!/usr/bin/env node
// vim: set ft=javascript:

const program = require('commander');
const scanReact = require('../lib/react');
const scanVue2 = require('../lib/vue');
const sh = require('shelljs');
const fs = require('fs');
const path = require('path')

if (!fs.existsSync(path.join(process.cwd(), './i18n-messages'))) {
  fs.mkdirSync(path.join(process.cwd(), './i18n-messages'))
}
if (!fs.existsSync(path.join(process.cwd(), './i18n-sources'))) {
  fs.mkdirSync(path.join(process.cwd(), './i18n-sources'))
}

program.parse(process.argv);

const type = program.args[0];

if (!type) return;

const scan = program.args[1] || './src';

if (type === 'react') {
  scanReact.run(scan);
}
if (type === 'vue') {
  scanVue2.run(scan);
}
