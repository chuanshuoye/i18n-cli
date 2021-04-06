## 安装

```bash
zanpm install @za/i18n-cli -g
```

## 环境

- `node`: **>12**
- `babel`: **>7**

## 本地项目 Babel Plugin 涉及依赖库

- @babel/preset-typescript
- @babel/env
- @babel/preset-react
- @babel/plugin-transform-typescript
- @babel/plugin-syntax-typescript
- @babel/plugin-syntax-jsx
- @babel/plugin-proposal-decorators
- @babel/plugin-proposal-class-properties
- @babel/plugin-proposal-object-rest-spread
- @babel/plugin-syntax-dynamic-import

## 具体使用方法

- 终端打开到当前项目工作目录下
- 执行指令 `扫描`
- 执行指令 `导出Excel`
- 等待翻译文件，并覆盖原 Excel 文件
- 执行指令 `读取Excel`
- 重新执行指令 `导出zh_CN.js`
- 项目执行指令 `自动注入替换`
- 将重新处理的文件使用到真实项目中进行替换,并将**zh_CN.js**内容作为国际化 Locale

## 相关指令


> `i18n-pick scan react [需要翻译的目录]`

- react扫描

> `i18n-pick scan vue [需要翻译的目录]`

- vue扫描

> `i18n-pick xlsx`

- 导出 Excel，会导出到**i18n-sources**目录

> `i18n-pick read`
- 读取 Excel
- 将翻译好的 excel 文件复制到**i18n-sources**目录，并重命名为`SheetJS.xlsx`,注意 excel 第一行表头是`id`,`defaultMessage`,`key`;
- 会在**i18n-sources**目录生成一份**data.json**文件
- 重新生成**zh-CH.json**文件


> `i18n-pick react`
- React 自动注入替换

> `i18n-pick vue`
- Vue 自动注入替换，表达式情况会遗漏，这块暂时没空去优化了，后面再看能不能集成 AST 去处理

> `i18n-pick export`
- 导出 国际化本地 Locale 文件：zh_CN.js
  

## 配置

- **i18n.config.js**

```js
module.exports = {
  // 引用语句
  importStatement: "import { I18N } from '@common/I18N';",
  // 调用语句
  callStatement: 'I18N.get',
  // 防止重复修数据，正则过滤规则，和‘callStatement’配合
  callPattern: /I18N\.get\(.+?\)/,
  // 不予扫描的文件，遵循 glob
  exclude: [],
  // 重写资源Key
  setKey: (item) => { 
    return "CONSOLE_KEY_" + Math.random(1000);
  },
  // 自定义资源Key
  getKey: (item) => {
    return item.id
  },
}
```

## 关于引用文件：@common/I18N

### 示例

- webpack alias

```json
alias: {
    '@common': path.resolve(__dirname, 'src/common'),
}
```

- src/common/I18N.js

```js
const zh_cn = require('xxx/ZH_CN.js')

module.exports = {
  get: (key) => {
    return zh_cn(key)
  },
}
```

## TODO

- 待续