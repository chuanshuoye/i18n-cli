const { parse } = require('@babel/parser');
const chalk = require('chalk')
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;

function babelParse(node, scanNodeList) {
  const { code } = node;
  const parseAst = parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-syntax-dynamic-import",
      "transform-vue-jsx",
    ]
  });

  // console.log(parseAst);

  traverse(parseAst, {
    enter(path) {
      const { node } = path;

      if (t.isTemplateLiteral(node)) {
        if (!node.quasis.every(word => !judgeChinese(word))) {
          return
        }
        const tempArr = [].concat(node.quasis, node.expressions).sort(function (a, b) {
          return a.start - b.start;
        })
        let v = '';
        tempArr.forEach(function (t) {
          if (t.type === 'TemplateElement') {
            v = `${replaceLineBreak(t.value.cooked)}`;
            scanNodeList.push({
              type: 'template',
              value: v,
              loc: node.loc
            })
          }
        })
      }

      if (t.isStringLiteral(node)) {
        const { value, loc, type } = node;
        if (path.parent.type === 'JSXAttribute') {
          if (judgeChinese(value)) {
            scanNodeList.push({
              type: 'jsx',
              value,
              loc: loc
            })
          }
        } else if (path.parent.type === 'ObjectProperty') {
          if (judgeChinese(value)) {
            scanNodeList.push({
              type: 'text',
              value: value,
              loc: loc
            })
          }
        } else if (path.parent.type === 'AssignmentExpression') {
          // path.skip();
        } else {
          if (judgeChinese(value)) {
            scanNodeList.push({
              type: 'text',
              value: value,
              loc: loc
            })
          }
        }
        path.skip();
      }
    }
  });
}

const replaceLineBreak = function (value) {
  if (typeof value !== 'string') return value
  return value.replace(/\n/g, ' ')
}

const judgeChinese = function (text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

module.exports = {
  babelParse,
}