const { NodeTypes } = require('@vue/compiler-core');
const { babelParse } = require('./babel-parse');
const chalk = require('chalk');
const _ = require('lodash');


function consoleText(tag, node) { }

function createExpressionSpaces(node) {
  const { content, loc } = node;
  let code = content;
  // console.log(content, loc)
  const startLine = loc.start.line;
  const startColumn = loc.start.column;
  const line = _.fill(Array(startLine - 1), '\n').join('');
  const column = _.fill(Array(startColumn - 1), ' ').join('');
  code = `${line}${column}${content}`;
  return code;
}

function createSpaces(node) {
  const { content, loc } = node;
  let code = content;
  console.log(content, loc)
  const startLine = loc.start.line;
  const endLine = loc.end.line;
  const line = _.fill(Array(startLine), '\n').join('');
  code = line + content;
  console.log(code)
  return code;
}

/**
 * 创建子节点
 * @param {*} node 
 */
function createChildNode(node) {
  if (!node) return {};
  const nNode = {
    type: node.type,
    tag: node.tag,
    props: node.props || [],
    loc: node.loc,
    branches: node.branches || [],
    children: node.children || [],
    exp: node.exp || {},
    value: node.value || {},
    content: node.content || ''
  };
  // consoleText('createChildNode', nNode)
  return nNode;
}

/**
 * 创建props节点
 * @param {*} props 
 * @param {*} list 
 */
function createNodeProps(props, list) {
  props.forEach(i => {
    list.push({
      type: i.type,
      name: i.name,
      loc: i.loc,
      exp: i.exp || {},
      value: i.value || {},
      content: i.content || '',
    });
    if (i.exp) {
      const code = createExpressionSpaces(i.exp);
      babelParse({ code }, list)
    }
  })
}


/**
 * 创建表达式节点
 * @param {*} content 
 * @param {*} list 
 */
function createContents(node, list) {
  if (!_.isObject(node)) return;
  const { children = [], content = '' } = node;
  if (children.length) {
    children.filter(i => i !== ' + ').forEach(i => {
      list.push(i)
    })
  } else {
    if (node.type === 4) {
      const code = createExpressionSpaces(node);
      babelParse({ code }, list)
    }
  }
}

function createBranches(branches, list = []) {
  if (!branches) return;
  branches.forEach(i => {
    const node = createChildNode(i);
    list.push(node);
    if (node?.children?.length) {
      createNodeProps(node.props, list)
      createBranches(node.children, list)
      createContents(node.content, list)
    }
  })
}

const judgeChinese = function (text) {
  if (text !== null && text !== '') {
    const reg = /[\u4e00-\u9fa5]/g;
    return text.match(reg).join('');
  }
  return '';
}

module.exports = {
  createChildNode,
  createNodeProps,
  createBranches,
  createContents,
  createExpressionSpaces,
  createSpaces
}