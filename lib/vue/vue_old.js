const glob = require('glob');
const compiler = require('vue-template-compiler');
const fs = require('fs');
const P = require('path');
const rimraf = require('rimraf');
const config = require('../../i18n.config.js')();

const textArr = [];
const zhCH = new Map();

const targetDir = config.targetDir;
const exclude = config.exclude;
const callExpression = config.callExpression;
const autoZhKey = config.autoZhKey;

function run(path) {
  glob(`${path}/**/*.vue`, { ignore: exclude.map(pattern => `${path}/${pattern}`) }, (error, files) => {
    files.forEach(filename => {
      if (filename.includes('node_modules')) {
        return;
      }
      // 如果文件目录带了_，我认为他是测试用例
      if (filename.indexOf('_') !== -1) {
        return;
      }
      // console.log(P.resolve(process.cwd(), filename));
      const data = fs.readFileSync(filename, 'utf-8');
      const vueAST = compiler.parseComponent(data, { pad: "line" });
      // 这里写到text中，为了避免重复
      scan(vueAST, filename)
    });
    // // 创建文件夹
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

function scan(t, path) {
  const types = ['template', 'script'];
  types.forEach(i => {
    const node = t[i];
    // console.log(node);
    const { content, type } = node;
    // console.log(path);
    detectChinese(content, path, node, type);
  })
}

function detectChinese(text, path, node, type) {
  if (/[\u4e00-\u9fa5]/.test(text)) {
    let repTxt = text.replace(/<!--[\s\S]*?-->/g, '');
    repTxt = repTxt.replace(/(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g, '');
    // console.log(repTxt);
    const matchs = repTxt.match(/[\u4e00-\u9fa5]+/g);
    // console.log(matchs);
    report(matchs, path, node, type)

  }
}

function report(matchs, path, node, type) {
  const { start, end } = path;
  const location = `${path}`;
  matchs && matchs.forEach(zhText => {
    // let zhText = i.replace(/"/g, '\\\"');
    // console.log(zhText)
    const sourceText = `${zhText}#${type}#${location}`;
    // console.log(sourceText)
    let notExist = false;
    if (type == 'template' && !~textArr.indexOf(`${zhText}#text#${location}`) && !~textArr.indexOf(`${zhText}#template#${location}`)) {
      notExist = true;
    }

    if (type == 'script' && !~textArr.indexOf(`${zhText}#text#${location}`) && !~textArr.indexOf(`${zhText}#script#${location}`)) {
      notExist = true;
    }

    if (notExist) {
      // 没有扫描过
      // console.log(sourceText);

      textArr.push(sourceText);
      // 中文文案已存在
      if (zhCH.has(zhText)) {
        const data = zhCH.get(zhText);
        data.source.push({ type, location });
        zhCH.set(zhText, data);
      } else {
        // 中文文案不存在
        zhCH.set(zhText, {
          id: autoZhKey ? zhText : "",
          defaultMessage: zhText,
          source: [{
            type,
            location
          }]
        });
      }
    }
  })
}

module.exports = {
  run,
};
