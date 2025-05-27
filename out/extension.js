"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pug = __importStar(require("pug"));
const vscode = __importStar(require("vscode"));
function activate(context) {
    // 注册编译命令
    let compileDisposable = vscode.commands.registerCommand('pug-format.compile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            compilePugFile(editor.document.uri.fsPath);
        }
    });
    // 注册格式化命令
    let formatDisposable = vscode.commands.registerCommand('pug-format.format', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'pug') {
            const config = vscode.workspace.getConfiguration('pug-format');
            const indentSize = config.get('indentSize') || 2;
            editor.edit(editBuilder => {
                const document = editor.document;
                const formattedContent = normalizeIndent(document.getText(), indentSize);
                editBuilder.replace(new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)), formattedContent);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage('Pug格式已修正');
                }
            });
        }
    });
    // 注册格式化提供程序
    let formattingProvider = vscode.languages.registerDocumentFormattingEditProvider('pug', {
        provideDocumentFormattingEdits(document) {
            const config = vscode.workspace.getConfiguration('pug-format');
            const indentSize = config.get('indentSize') || 2;
            const formatted = normalizeIndent(document.getText(), indentSize);
            const range = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
            return [vscode.TextEdit.replace(range, formatted)];
        }
    });
    context.subscriptions.push(compileDisposable, formatDisposable, formattingProvider);
    // 监听文件保存事件
    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'pug') {
            const config = vscode.workspace.getConfiguration('pug-format');
            if (config.get('autoCompile')) {
                compilePugFile(document.uri.fsPath);
            }
        }
    }, null, context.subscriptions);
}
exports.activate = activate;
/*缩进修正函数*/
function normalizeIndent(content, indentSize) {
    var _a;
    const lines = content.split('\n');
    const config = vscode.workspace.getConfiguration('pug-format');
    const fixIndent = (_a = config.get('fixIndent')) !== null && _a !== void 0 ? _a : true;
    if (!fixIndent) {
        return content;
    }
    // 用于存储每行的信息
    const lineInfo = lines.map(line => {
        var _a, _b;
        return ({
            content: line,
            indent: ((_b = (_a = line.match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) || 0,
            // 忽略空行和注释行
            isContent: !(/^\s*$/.test(line) || /^\s*\/\//.test(line) || /^\s*-\s*\/\//.test(line))
        });
    });
    // 修正缩进
    for (let i = 1; i < lineInfo.length; i++) {
        const current = lineInfo[i];
        if (!current.isContent)
            continue; // 跳过空行和注释行
        // 查找上一个有效内容行
        let prevIndex = i - 1;
        while (prevIndex >= 0 && !lineInfo[prevIndex].isContent) {
            prevIndex--;
        }
        if (prevIndex >= 0) {
            const prev = lineInfo[prevIndex];
            const prevIndent = prev.indent;
            const currentIndent = current.indent;
            // 检查是否需要增加缩进
            if (currentIndent <= prevIndent &&
                // 检查当前行是否应该是子元素（通过检查前一行是否以冒号结尾或包含管道符号）
                (prev.content.trim().endsWith(':') || prev.content.includes('|'))) {
                // 子元素应该比父元素多一个缩进级别
                const expectedIndent = prevIndent + indentSize;
                const missingSpaces = expectedIndent - currentIndent;
                if (missingSpaces > 0) {
                    lines[i] = ' '.repeat(missingSpaces) + lines[i];
                }
            }
            // 检查是否是兄弟元素
            else if (currentIndent < prevIndent &&
                !prev.content.trim().endsWith(':') &&
                !prev.content.includes('|')) {
                // 兄弟元素应该有相同的缩进
                const missingSpaces = prevIndent - currentIndent;
                if (missingSpaces > 0) {
                    lines[i] = ' '.repeat(missingSpaces) + lines[i];
                }
            }
        }
    }
    return lines.join('\n');
}
function compilePugFile(filePath) {
    try {
        const config = vscode.workspace.getConfiguration('pug-format');
        let outputPath = config.get('outputPath') || '';
        const outputPathFormat = config.get('outputPathFormat') || 'same';
        const pretty = config.get('pretty') || false;
        // 读取Pug文件内容
        const pugContent = fs.readFileSync(filePath, 'utf8');
        // 编译Pug为HTML
        const html = pug.compile(pugContent, {
            filename: filePath,
            pretty: pretty
        })();
        // 生成输出文件路径
        let finalOutputPath = '';
        const fileExtension = path.extname(filePath);
        const fileNameWithoutExt = path.basename(filePath, fileExtension);
        switch (outputPathFormat) {
            case 'same':
                // 默认行为：输出到相同目录
                finalOutputPath = filePath.replace(/\.pug$/, '.html');
                break;
            case 'custom':
                // 自定义输出目录
                if (outputPath) {
                    let targetOutputPath;
                    if (path.isAbsolute(outputPath)) {
                        // 如果是绝对路径，直接使用
                        targetOutputPath = outputPath;
                    }
                    else {
                        // 如果是相对路径，基于当前文件所在目录
                        targetOutputPath = path.join(path.dirname(filePath), outputPath);
                    }
                    // 确保输出目录存在
                    if (!fs.existsSync(targetOutputPath)) {
                        fs.mkdirSync(targetOutputPath, { recursive: true });
                    }
                    finalOutputPath = path.join(targetOutputPath, `${fileNameWithoutExt}.html`);
                }
                else {
                    // 如果未设置输出路径，回退到默认行为
                    finalOutputPath = filePath.replace(/\.pug$/, '.html');
                }
                break;
            case 'relative':
                // 保持相对路径结构但使用不同的根目录
                if (outputPath) {
                    let targetOutputPath;
                    if (path.isAbsolute(outputPath)) {
                        // 如果是绝对路径，直接使用
                        targetOutputPath = outputPath;
                    }
                    else {
                        // 处理以/开头的相对路径
                        if (outputPath.startsWith('/')) {
                            outputPath = outputPath.substring(1);
                        }
                        // 基于工作区根目录
                        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
                        if (workspaceFolder) {
                            targetOutputPath = path.join(workspaceFolder.uri.fsPath, outputPath);
                            // 确保输出目录存在
                            if (!fs.existsSync(targetOutputPath)) {
                                fs.mkdirSync(targetOutputPath, { recursive: true });
                            }
                        }
                        else {
                            // 如果无法确定工作区，回退到默认行为
                            return filePath.replace(/\.pug$/, '.html');
                        }
                    }
                    // 获取工作区文件夹
                    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
                    if (workspaceFolder) {
                        // 计算文件相对于工作区的路径
                        const relativePath = path.relative(workspaceFolder.uri.fsPath, path.dirname(filePath));
                        // 组合新的输出路径
                        const newOutputDir = path.join(targetOutputPath, relativePath);
                        // 确保输出目录存在
                        if (!fs.existsSync(newOutputDir)) {
                            fs.mkdirSync(newOutputDir, { recursive: true });
                        }
                        finalOutputPath = path.join(newOutputDir, `${fileNameWithoutExt}.html`);
                    }
                    else {
                        // 如果无法确定工作区，回退到默认行为
                        finalOutputPath = filePath.replace(/\.pug$/, '.html');
                    }
                }
                else {
                    // 如果未设置输出路径，回退到默认行为
                    finalOutputPath = filePath.replace(/\.pug$/, '.html');
                }
                break;
            default:
                // 默认行为
                finalOutputPath = filePath.replace(/\.pug$/, '.html');
        }
        // 确保输出文件的目录存在
        const outputDir = path.dirname(finalOutputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // 写入文件
        fs.writeFileSync(finalOutputPath, html);
        vscode.window.showInformationMessage(`已成功编译 ${path.basename(filePath)} 到 ${finalOutputPath}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`编译失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map