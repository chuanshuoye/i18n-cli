## 安装

```bash
sudo zanpm install @za/i18n-cli -g
```

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

### 扫描

- react
  `i18n-pick scan react [需要翻译的目录]`

- vue
  `i18n-pick scan vue [需要翻译的目录]`

### 导出 Excel

- 会导出到**i18n-sources**目录

`i18n-pick xlsx`

### 读取 Excel

- 将翻译好的 excel 文件复制到**i18n-sources**目录，并重命名为`SheetJS.xlsx`,注意 excel 第一行表头是`id`,`defaultMessage`,`key`;
- 会在**i18n-sources**目录生成一份**data.json**文件

`i18n-pick read`

- 重新生成**zh-CH.json**文件

### React 自动注入替换

`i18n-pick react`

### Vue 自动注入替换

- 表达式情况会遗漏，这块暂时没空去优化了，后面再看能不能集成 AST 去处理

`i18n-pick vue`

### 导出 国际化本地 Locale 文件：zh_CN.js

`i18n-pick export`

### 配置

i18n.config.json

```js
{
  // 引用语句
  "importStatement": "import { I18N } from '@common/I18N';",
  // 调用语句
  "callStatement": "I18N.get",
  // 语言文件目标目录
  "targetDir": "i18n-messages",
  // 不予扫描的文件，遵循 glob
  "exclude": [
    "**/demo.{js,jsx}"
  ],
  // 自动中文做key
  "autoZhKey": true,
  // 自定义资源Key
  "getKey": (item) => {
    return item.id;
  }
}
```

### TODO

- 需要增加一个自定义资源 key 的配置处理`getKey = () => {}`
- **Vue**项目关于 expression 中的中文匹配问题
- 默认执行`prettier`代码格式化导致位置匹配错误问题
  - **暂时请先关闭编辑器自带的格式化功能**
