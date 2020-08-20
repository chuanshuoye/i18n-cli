#!/usr/bin/env node
// vim: set ft=javascript:

const fs = require('fs');
const program = require('commander');
const path = require('path');
const _ = require('lodash');
const config = require('../i18n.config')();

program.parse(process.argv);


const needImport = [];
const importStatement = config.importStatement;
const callStatement = config.callStatement;
const callPattern = config.callPattern;
const targetDir = config.targetDir;
const sourceMapPath = path.join(process.cwd(), targetDir, 'zh-CH.json');

function testAttr(text, exp) {
  const reg = ` ${exp}=`;
  // 有个缺陷，如果都在一行中，可能会导致替换错误，人工修改
  return _.isString(text) && new RegExp(reg).test(text)
}

function replace(text, chinese, replaceString) {
  if (text) {
    let textArr = text.split(callPattern);
    const newArr = JSON.parse(JSON.stringify(textArr));
    textArr.forEach((item, index, arr) => {
      arr[index] = item.replace(chinese, replaceString);
    });
    newArr.forEach((item, index, arr) => {
      if (item !== textArr[index]) {
        text = text.replace(item, textArr[index]);
      }
    })
  }
  return text;
}

function generateAndWrite(sourceObj) {
  if (!sourceObj) return;
  const { key, attr, text, textType, filename, line, column } = sourceObj;

  let left = `${callStatement}(`;
  let right = ')';

  // 拿到文件数据
  const data = fs.readFileSync(filename, 'utf8');
  const arr = data.split('\n');

  const temp1 = arr[line - 1];
  const temp2 = arr[line];
  let chinese = text.replace(/\\"/g, '"');
  if (!chinese) {
    console.log(filename, key, '缺少defaultMessage字段值！')
    return;
  }
  let replaceString = `${left}'${key}'${right}`
  // 这里是为了匹配前后如果有引号的情况
  if ([6, 7].includes(textType)) {
    arr[line - 1] = replace(arr[line - 1], `"${chinese}"`, `"${replaceString}"`);
    // 匹配attribute情况下替换为：:xxx=""
    if (textType === 6 && attr) {
      if (testAttr(arr[line - 1], `${attr}`)) {
        arr[line - 1] = replace(arr[line - 1], `${attr}`, `:${attr}`);
      }
    }
  }

  if ([2, 12].includes(textType)) {
    replaceString = `{{${left}'${key}'${right}}}`;
  }
  // jsx语法
  if (textType == 'jsx') {
    left = '{' + `${callStatement}(`;
    right = ')}';
    replaceString = `${left}'${key}'${right}`;
  }
  // 模版语法
  if (textType == 'template') {
    left = '${' + `${callStatement}(`;
    right = ')}';
    replaceString = `${left}'${key}'${right}`;
  }

  if (!arr[line - 1]) return;
  arr[line - 1] = replace(arr[line - 1], `"${chinese}"`, replaceString);
  if (temp1 === arr[line - 1]) {
    arr[line - 1] = replace(arr[line - 1], `'${chinese}'`, replaceString);
    if (temp1 === arr[line - 1]) {
      arr[line - 1] = replace(arr[line - 1], chinese, replaceString);
      if (temp1 === arr[line - 1]) {
        arr[line] = replace(arr[line], `"${chinese}"`, replaceString);
        if (temp2 === arr[line]) {
          arr[line] = replace(arr[line], `'${chinese}'`, replaceString);
          if (temp2 === arr[line]) {
            arr[line] = replace(arr[line], chinese, replaceString);
            if (temp2 === arr[line]) {
              console.log(arr[line])
              if (arr[line].indexOf(text) !== -1 ||
                arr[line - 1].indexOf(text) !== -1) {
                console.log('失败，请手动替换', JSON.stringify(sourceObj, null, "\t"));
                return 0;
              }
            }
          }
        }
      }
    }
  }
  // }

  const result = arr.join('\n');

  if (filename.includes('.js')) {
    if (needImport.indexOf(filename) === -1 && arr.indexOf(importStatement) === -1) {
      needImport.push(filename);
    }
  }

  fs.writeFileSync(filename, result, 'utf8');
  return 1;
}


let data = null;
try {
  data = require(sourceMapPath);
} catch (e) {
  console.log('获取映射文件出错！', e);
  return;
}

data.forEach(item => {
  item.source.forEach(src => {
    const [filename, line, column] = src.location.split('#');
    const opts = {
      key: config.getKey ? config.getKey(item) : item.id,
      text: item.defaultMessage,
      textType: src.type,
      attr: src.attr,
      filename: filename,
      line: line,
      column: column
    };
    const flag = generateAndWrite(opts);
    if (flag) {
      console.log('替换成功，' + opts.text + ' => ' + opts.key + ' #' + src.location);
    }
  })
});

// 这里加上文件头的import
needImport.forEach(src => {
  fs.readFile(src, 'utf8', (err, data) => {
    if (err) return console.log(err);

    const result = `${importStatement}\n${data}`;
    fs.writeFile(src, result, 'utf8', e => {
      if (e) return console.log(e);
      return 1;
    });
    return 1;
  });
});
