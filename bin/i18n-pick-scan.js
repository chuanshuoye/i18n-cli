#!/usr/bin/env node
// vim: set ft=javascript:

const program = require('commander');
const scanReact = require('../lib/react');
const scanVue2 = require('../lib/vue');

program.parse(process.argv);

const type = program.args[0];

if (!type) return;

const path = program.args[1] || './src';

if (type === 'react') {
  scanReact.run(path);
}
if (type === 'vue') {
  scanVue2.run(path);
}
