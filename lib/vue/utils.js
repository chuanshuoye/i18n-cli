const { NodeTypes } = require('@vue/compiler-core');
const { babelParse } = require('./babel-parse');
const chalk = require('chalk');
const _ = require('lodash');


function consoleText(tag, node) { }

function createExpressionSpaces(node) {
  const { content, loc } = node;
  let code = content;
  const startLine = loc.start.line;
  const startColumn = loc.start.column;
  const line = _.fill(Array(startLine - 1), '\n').join('');
  const column = _.fill(Array(startColumn - 1), ' ').join('');
  code = `${line}${column}${content}`;
  return code;
}

function createSpaces(node) {
  const { content, loc } = node;
  const startLine = loc.start.line;
  const endLine = loc.end.line;
  const line = _.fill(Array(startLine - 1), '\n').join('');
  code = `${line}` + content;
  return code;
}

/**
 * 创建子节点
 * @param {*} node 
 */
function createChildNode(node) {
  if (!node) return {};
  // console.log('childNode', node)
  const nNode = {
    type: node.type,
    tag: node.tag,
    props: node.props || [],
    loc: node.loc,
    branches: node.branches || [],
    children: node.children || [],
    exp: node.exp || {},
    condition: node.condition || {},
    value: node.value || {},
    content: node.content || ''
  };
  return nNode;
}

/**
 * 创建props节点
 * @param {*} props 
 * @param {*} list 
 */
function createNodeProps(props, list) {
  props.forEach(i => {
    // console.log('props', i)
    list.push({
      type: i.type,
      name: i.name,
      loc: i.loc,
      exp: i.exp || {},
      value: i.value || {},
      content: i.content || '',
    });

    if (i.exp) {
      const { type, content } = i.exp;
      if (type === 4 && judgeChinese(content)) {
        // console.log('nodeType:4', content)
        const code = createExpressionSpaces(i.exp);
        babelParse({ code }, list)
      }
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
  if (node?.type === 2) {
    // console.log('nodeType:2', content)
    list.push(node);
  }
  if (node?.type === 4 && judgeChinese(content)) {
    // console.log('nodeType:4', content)
    const code = createExpressionSpaces(node);
    babelParse({ code }, list)
  }
}

function createCondition(node, list) {
  if (!_.isObject(node)) return;
  const { children = [], content = '' } = node;
  if (node?.type === 2) {
    // console.log('nodeType:2', content)
    list.push(node);
  }
  if (node?.type === 4 && judgeChinese(content)) {
    // console.log('nodeType:4', content)
    const code = createExpressionSpaces(node);
    babelParse({ code }, list)
  }
}

function createBranches(branches, list = []) {
  if (!branches) return;
  branches.forEach(i => {
    const node = createChildNode(i);
    // console.log('branch', node)
    createNodeProps(node.props, list)
    createContents(node.content, list)
    createCondition(node.condition, list)
    if (i.branches?.length) {
      createBranches(node.branches, list);
    }
    if (node.children?.length) {
      createBranches(node.children, list)
    }
  })
}

const judgeChinese = function (text) {
  if (text !== null && text !== '') {
    const reg = /[\u4e00-\u9fa5]/g;
    return text.match(reg)?.join('');
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