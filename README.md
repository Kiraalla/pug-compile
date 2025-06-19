# Pug Compile

VSCode扩展，用于将Pug文件编译为HTML

## 功能

- Pug/Jade 语法高亮
- Pug/Jade 文件格式化
  - 支持 VS Code 标准格式化快捷键
  - 支持格式化规则自定义
  - 集成到 VS Code 格式化系统
- Pug/Jade 文件编译
  - 支持编译为HTML
  - 支持保存时自动编译
  - 自定义输出路径和格式
  - HTML输出美化选项

## 安装

1. 在VSCode扩展市场中搜索"Pug Compile"
2. 点击安装
3. 重启VSCode

## 使用

1. 打开一个Pug文件
2. 右键点击编辑器或使用命令面板(Ctrl+Shift+P)
3. 选择"Pug Compile：将Pug编译为HTML"
4. 或点击编辑器右上角的pug图标即可编译Pug文件

### 配置

在VSCode设置中搜索"pug-compile"可配置以下选项：

#### 编译相关配置

- `pug-compile.autoCompile`: 保存时自动编译
  - 类型: `boolean`
  - 默认值: `false`
  - 说明: 启用后，保存Pug文件时会自动编译为HTML

- `pug-compile.outputPath`: 自定义输出目录
  - 类型: `string`
  - 默认值: `""`
  - 说明: 指定编译后HTML文件的输出目录，可以是相对路径或绝对路径
  - 示例: `"dist"`, `"../output"`, `"D:/output"`

- `pug-compile.outputPathFormat`: 输出路径格式
  - 类型: `string`
  - 默认值: `"same"`
  - 可选值:
    - `same`: 在同一目录下生成HTML文件
    - `custom`: 使用自定义输出目录
    - `relative`: 保持相对路径结构，但使用不同的根目录

- `pug-compile.pretty`: 美化HTML输出
  - 类型: `boolean`
  - 默认值: `false`
  - 说明: 启用后，生成的HTML文件会进行格式化，便于阅读

#### 格式化相关配置

- `pug-compile.format.enable`: 启用Pug格式化功能
  - 类型: `boolean`
  - 默认值: `true`
  - 说明: 是否启用Pug文件的格式化功能

- `pug-compile.format.fillTab`: 使用Tab进行缩进
  - 类型: `boolean`
  - 默认值: 跟随编辑器设置
  - 说明: 为`true`时使用Tab缩进，为`false`时使用空格缩进

- `pug-compile.format.omitDiv`: 省略div标签
  - 类型: `boolean`
  - 默认值: `false`
  - 说明: 当元素具有id或class时，省略div标签名
  - 示例: `#id.class` 而不是 `div#id.class`

- `pug-compile.format.tabSize`: 缩进大小
  - 类型: `number`
  - 默认值: 跟随编辑器设置
  - 说明: 使用空格缩进时的空格数量

### 快捷键和命令

- 编译Pug文件：
  - 快捷键:
    - Windows/Linux: `Ctrl+Alt+C`
    - macOS: `Cmd+Alt+C`
  - 命令面板: 
    - `Pug Compile：将Pug编译为HTML`
  - 其他方式:
    - 编辑器右上角的 Pug 图标
    - 编辑器上下文菜单（右键菜单）

- 格式化Pug文件：
  - 使用 VS Code 的标准格式化快捷键：
    - Windows/Linux: `Shift+Alt+F`
    - macOS: `Shift+Option+F`
  - 命令面板:
    - `格式化文档` 或 `Format Document`
    - `Pug：格式化文件`

## 问题反馈

请到[GitHub Issues](https://github.com/Kiraalla/pug-compile/issues)报告问题

## 许可证

MIT - 详见[LICENSE](LICENSE)文件