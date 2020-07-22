const { parse } = require('@babel/parser');
const chalk = require('chalk')
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;

// console.log(traverse)

function babelParse(node, scanNodeList) {
  const { code, loc } = node;
  // console.log(loc)
  const parseAst = parse(code, {
    sourceType: "module",
    plugins: [
      "@babel/plugin-syntax-jsx",
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-syntax-dynamic-import",
    ]
  });

  traverse(parseAst, {
    enter(path) {
      const { node } = path;
      // console.log(chalk.yellow('path'), path);
      // console.log(path.type, node.properties && node.properties.value)
      if (t.isStringLiteral(node)) {
        // console.log('before', node.loc)
        if (node.value === '') return;
        node.loc.start.line += loc.start.line - 1;
        node.loc.end.line += loc.start.line - 1;
        // console.log('after', node, node.loc)
        scanNodeList.push({
          type: node.type,
          value: node.value,
          loc: node.loc
        })
      }
    }
  });
}

module.exports = {
  babelParse,
}