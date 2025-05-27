# Pug Compile

VSCode扩展，用于将Pug文件编译为HTML

## 功能

- pug语法高亮
- 将Pug/Jade文件编译为HTML
- 支持保存时自动编译（可配置）
- 自定义输出路径和格式
- 美化HTML输出

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

- `pug-compile.autoCompile`: 保存时自动编译（默认: false）
- `pug-compile.outputPath`: 自定义输出目录
- `pug-compile.outputPathFormat`: 输出路径格式（same|relative|custom）
- `pug-compile.pretty`: 美化HTML输出（默认: false）

## 问题反馈

请到[GitHub Issues](https://github.com/Kiraalla/pug-compile/issues)报告问题

## 许可证

MIT - 详见[LICENSE](LICENSE)文件