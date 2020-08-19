const glob = require('glob');
const chalk = require('chalk');
const { compile } = require('@vue/compiler-dom');
const { baseParse } = require('@vue/compiler-core');
const fs = require('fs');
const Path = require('path');
const _ = require('lodash');
const rimraf = require('rimraf');
const utils = require('./utils');
const babel = require('./utils/babel-parse');
const scanReact = require('../react');
const config = require('../../i18n.config.js')();

const textArr = [];
const zhCH = new Map();

const targetDir = config.targetDir;
const exclude = config.exclude;
const callExpression = config.callExpression;
const autoZhKey = config.autoZhKey;
const textPattern = config.textPattern;

function run(path) {
  glob(`${path}/**/*.{vue,js,ts}`, { ignore: exclude.map(pattern => `${path}/${pattern}`) }, (error, files) => {
    files.forEach(filename => {
      if (filename.includes('node_modules')) {
        return;
      }
      // 如果文件目录带了_，我认为他是测试用例
      if (filename.indexOf('_') !== -1) {
        return;
      }

      const data = fs.readFileSync(filename, 'utf-8');
      const path = Path.resolve(process.cwd(), filename);
      // .vue
      if (filename.includes('.vue')) {
        const ast = baseParse(data);
        scan(ast, path)
      }
      // .js && .ts
      if (filename.includes('.js') || filename.includes('.ts')) {
        scanFile(data, path)
      }

    });

    // 这里写到text中，为了避免重复
    // 创建文件夹
    rimraf.sync(targetDir);
    fs.mkdirSync(targetDir);
    fs.appendFile(`${targetDir}/sourcemap.txt`, textArr.map((item, i) => `${item}#${i}\n`).join(''), function (err) {
      if (err) {
        return console.error(err);
      }
      console.log(`----共扫描中文文案 ${textArr.length} 条----`);
    });
    fs.appendFile(`${targetDir}/zh-CH.json`, `${JSON.stringify([...zhCH.values()], null, '\t')}`, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log(`----去重后中文文案为 ${zhCH.size} 条----`);
    });
  });
}

const scanNodeList = [];

// 还有子集，递归轮训处理
function scanTemplateNode(node) {
  if (!node) return;
  const nNode = utils.createChildNode(node)
  // 处理props参数
  utils.createNodeProps(nNode.props, scanNodeList);
  // 处理branches参数
  utils.createBranches(nNode.branches, scanNodeList);
  // 如果content是对象
  utils.createContents(nNode.content, scanNodeList);

  // 如果有children参数
  if (nNode.children.length) {
    nNode.children.forEach(i => {
      const nextNode = utils.createChildNode(i)
      // 注释代码，忽略
      if (nextNode.type === 3) return;
      // 累计node添加
      scanNodeList.push(nextNode);
      // 递归
      scanTemplateNode(nextNode)
    })
  }
}


function scanScriptNode(node) {
  const { content, loc } = node;
  babel.babelParse({ code: children[0].content, loc }, scanNodeList);
}



function scanFile(content, path) {
  babel.babelParse({ code: content }, scanNodeList);
  output(path)
}

function scan(ast, path) {
  const { children } = ast;

  children && children.forEach((i, index) => {
    if (i.tag === 'template') {
      scanTemplateNode(i);
    }
    if (i.tag === 'script') {
      const { children, loc } = i;
      const content = children[0].content;
      // script标签是否第一个，如果不是则轮询叠加template标签内容行数
      const scriptNode = index > 0 ? utils.createSpaces({ content, loc }) : content;
      babel.babelParse({ code: scriptNode }, scanNodeList);
    }
  })

  output(path)

}

function output(path) {
  // console.log(scanNodeList)
  scanNodeList.forEach((i, index) => {
    i.filename = i.filename || path
    if (_.isNumber(i.type)) {
      const { value } = i;
      detectChinese(value?.content || i.content, i, 'text', i.type)
    } else {
      detectChinese(i.value, i, 'text', i.type)
    }
  })
}

function detectChinese(text, path, type, babelType) {
  if (textPattern.test(text)) {
    report(text, path, type, babelType)
  }
}

function report(text, path, type, babelType) {
  const { loc, name } = path;
  const location = `${path.filename}#${loc ? loc.start.line : '!!!'}#${loc ? loc.start.column : '!!!'}`;

  let zhText = text.replace(/"/g, '\\\"');
  zhText = babelType == 2 ? zhText.trim() : zhText;

  const sourceText = `${zhText}#${type}#${location}`;
  let notExist = false;
  if (type == 'text' && !~textArr.indexOf(`${zhText}#text#${location}`)) {
    notExist = true;
  }

  if (notExist) {
    // 没有扫描过
    console.log(sourceText + '#' + babelType);

    textArr.push(sourceText);
    // 中文文案已存在
    if (zhCH.has(zhText)) {
      const data = zhCH.get(zhText);
      data.source.push({ type: babelType, location, attr: babelType === 6 ? name : undefined });
      zhCH.set(zhText, data);
    } else {
      // 中文文案不存在
      zhCH.set(zhText, {
        id: autoZhKey ? zhText : "",
        defaultMessage: zhText,
        source: [{
          type: babelType,
          location,
          attr: babelType === 6 ? name : undefined
        }]
      });
    }
  }
}

module.exports = {
  run,
};
