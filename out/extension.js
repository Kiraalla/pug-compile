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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const compiler_1 = require("./modules/compiler");
const formatter_1 = require("./modules/formatter");
let outputChannel;
/**
 * 扩展被激活时调用
 */
function activate(context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // 创建输出通道
        outputChannel = vscode.window.createOutputChannel('Pug Compile');
        outputChannel.appendLine('Pug Compile extension is being activated...');
        outputChannel.show();
        try {
            const formatter = new formatter_1.PugFormatter();
            // 创建状态栏项
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
            statusBarItem.text = "$(code) Pug";
            statusBarItem.tooltip = "Pug Compile Active";
            context.subscriptions.push(statusBarItem);
            // 注册编译命令
            outputChannel.appendLine('Registering compile command...');
            const compileCommand = vscode.commands.registerCommand('pug-compile.compile', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    outputChannel.appendLine('Compile command triggered');
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showWarningMessage('No active editor');
                        return;
                    }
                    if (editor.document.languageId !== 'pug') {
                        vscode.window.showWarningMessage('Not a Pug file');
                        return;
                    }
                    yield compiler_1.PugCompiler.compile(editor.document.uri.fsPath);
                    vscode.window.showInformationMessage('Pug file compiled successfully');
                }
                catch (error) {
                    outputChannel.appendLine(`Error during compilation: ${error}`);
                    vscode.window.showErrorMessage(`Failed to compile: ${error}`);
                }
            }));
            // 注册格式化命令
            outputChannel.appendLine('Registering format command...');
            const formatCommand = vscode.commands.registerCommand('pug-compile.format', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    outputChannel.appendLine('Format command triggered');
                    const editor = vscode.window.activeTextEditor;
                    if (!editor || editor.document.languageId !== 'pug') {
                        return;
                    }
                    const document = editor.document;
                    const edits = formatter.formatDocument(document, editor);
                    const edit = new vscode.WorkspaceEdit();
                    edit.replace(document.uri, edits[0].range, edits[0].newText);
                    yield vscode.workspace.applyEdit(edit);
                    vscode.window.showInformationMessage('Pug file formatted');
                }
                catch (error) {
                    outputChannel.appendLine(`Error during formatting: ${error}`);
                    vscode.window.showErrorMessage(`Failed to format: ${error}`);
                }
            }));
            // 注册格式化提供程序
            const formatterProvider = vscode.languages.registerDocumentFormattingEditProvider('pug', {
                provideDocumentFormattingEdits: (document) => {
                    return formatter.formatDocument(document, vscode.window.activeTextEditor);
                }
            });
            // 监听文件保存事件
            const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
                if (document.languageId === 'pug') {
                    outputChannel.appendLine('Pug file saved');
                    const config = vscode.workspace.getConfiguration('pug-compile');
                    const autoCompile = config.get('autoCompile');
                    const ignoreUnderscore = config.get('ignoreUnderscore');
                    const fileName = document.uri.fsPath.split(/[/\\]/).pop() || '';
                    if (autoCompile) {
                        if (ignoreUnderscore && fileName.startsWith('_')) {
                            outputChannel.appendLine('Ignored pug file (starts with underscore): ' + fileName);
                            return;
                        }
                        compiler_1.PugCompiler.compile(document.uri.fsPath);
                    }
                }
            });
            // 注册文件打开事件
            const openListener = vscode.workspace.onDidOpenTextDocument((document) => {
                if (document.languageId === 'pug') {
                    outputChannel.appendLine(`Pug file opened: ${document.uri.fsPath}`);
                    statusBarItem.show();
                }
            });
            // 将所有注册项添加到订阅中
            context.subscriptions.push(compileCommand, formatCommand, formatterProvider, saveListener, openListener, outputChannel);
            // 如果当前打开的是pug文件，显示状态栏
            if (((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) === 'pug') {
                statusBarItem.show();
            }
            outputChannel.appendLine('Pug Compile extension activated successfully');
            vscode.window.showInformationMessage('Pug Compile extension is now active');
        }
        catch (error) {
            outputChannel.appendLine(`Error during activation: ${error}`);
            console.error('Failed to activate extension:', error);
            throw error;
        }
    });
}
exports.activate = activate;
function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('Pug Compile extension is being deactivated...');
        outputChannel.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map