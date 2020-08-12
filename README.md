## 具体使用方法

- 将需要翻译的文件夹 Copy 一份到当前项目工作目录下
- 执行指令 `扫描`
- 执行指令 `导出Excel`
- 等待翻译文件，并覆盖原 Excel 文件
- 执行指令 `读取Excel`
- 重新执行指令 `导出zh_CN.js`
- react 项目执行指令 `自动注入替换`, vue 项目执行指令 `中文全量替换`
- 将重新处理的文件使用到真实项目中进行替换,并将**zh_CN.js**内容作为国际化 Locale

## 相关指令

### 扫描

- react
  `npm run i18n scan react [需要翻译的目录]`

- vue
  `npm run i18n scan vue [需要翻译的目录]`

### 导出 Excel

- 会导出到**i18n-sources**目录

`npm run xlsx`

### 读取 Excel

- 将翻译好的 excel 文件复制到**i18n-sources**目录，并重命名为`SheetJS.xlsx`,注意 excel 第一行表头是`id`,`defaultMessage`,`key`;
- 会在**i18n-sources**目录生成一份**data.json**文件

`npm run read`

- 重新生成**zh-CH.json**文件

### React 自动替换

`npm run i18n pick`

### Vue 中文替换

- 表达式情况会遗漏，这块暂时没空去优化了，后面再看能不能集成 AST 去处理

`npm run i18n vue`

### 导出 zh_CN.js

`npm run i18n export`

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
  // 是否统计函数参数中的中文
  "callExpression": true,
  // 自动中文做key
  "autoZhKey": true,
  // 自定义资源Key
  "getKey": (item) => {
    return item.id;
  }
}
```

### TODO

- `autoKey`需要增加一个自定义资源 key 的配置处理
- **Vue**项目关于 expression 中的中文匹配问题
- 默认未执行`prettier`代码格式化导致位置匹配错误问题
