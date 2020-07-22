const { NodeTypes, transform } = require('@vue/compiler-core');
const chalk = require('chalk');
const _ = require('lodash');


function consoleText(tag, node) {
  if ([2, 6, 7].includes(node?.type)) {
    console.log(chalk.blue(tag + ':\n'), node)
  }
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
  consoleText('createChildNode', nNode)
  return nNode;
}

/**
 * 创建props节点
 * @param {*} props 
 * @param {*} list 
 */
function createNodeProps(props, list) {
  // console.log(chalk.yellow('createNodeProps:\n'))
  props.forEach(i => {
    consoleText('createNodeProps', i)
    list.push({
      type: i.type,
      name: i.name,
      loc: i.loc,
      exp: i.exp || {},
      value: i.value || {},
      content: i.content || '',
    });
  })
}


/**
 * 创建表达式节点
 * @param {*} content 
 * @param {*} list 
 */
function createContents(content, list) {
  // console.log(chalk.blue('createContents start:\n'))
  if (!_.isObject(content)) return;
  const { children = [] } = content;
  children.filter(i => i !== ' + ').forEach(i => {
    list.push(i)
  })
  // console.log(chalk.blue('createContents end:\n'))
}

function createBranches(branches, list = []) {
  console.log(chalk.yellow('createBranches start:\n'))
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
  console.log(chalk.yellow('createBranches end:\n'))
}

module.exports = {
  createChildNode,
  createNodeProps,
  createBranches,
  createContents,
}