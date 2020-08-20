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
    ]
  });
  traverseAst(parseAst, scanNodeList);
}


const traverseAst = function (ast, scanNodeList) {
  traverse(ast, {
    enter(path) {
      const { node } = path;
      // console.log(node.type, node.name)
      if (t.isDirectiveLiteral(node)) {
        const { value, loc, type } = node;
        if (judgeChinese(value)) {
          scanNodeList.push({
            type: 'text',
            value,
            loc
          })
        }
      }
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
            if (judgeChinese(v)) {
              scanNodeList.push({
                type: 'template',
                value: v,
                loc: node.loc
              })
            }
          }
        })
      }

      if (t.isStringLiteral(node)) {
        const { value, loc, type } = node;
        if (path.parent.type === 'JSXAttribute') {
          if (judgeChinese(value)) {
            scanNodeList.push({
              type: 'jsx',
              value: value.trim(),
              loc: loc
            })
          }
        } else if (path.parent.type === 'ObjectProperty') {
          if (judgeChinese(value)) {
            scanNodeList.push({
              type: 'text',
              value: value.trim(),
              loc: loc
            })
          }
        } else if (path.parent.type === 'AssignmentExpression') {
          const { value, loc } = node
          if (judgeChinese(value)) {
            // console.log('AssignmentExpression', node.value)
            scanNodeList.push({
              type: 'text',
              value: value.trim(),
              loc: loc
            })
          }
        } else {
          if (judgeChinese(value)) {
            // console.log(node)
            scanNodeList.push({
              type: 'text',
              value: value.trim(),
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
  traverseAst
}