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
const vscode = __importStar(require("vscode"));
const compiler_1 = require("./modules/compiler");
const formatter_1 = require("./modules/formatter");
/**
 * 扩展被激活时调用
 */
function activate(context) {
    const formatter = new formatter_1.PugFormatter();
    // 注册格式化命令
    const formatDisposable = vscode.commands.registerCommand('pug-compile.format', () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor || activeTextEditor.document.languageId !== 'pug') {
            return;
        }
        const document = activeTextEditor.document;
        const edits = formatter.formatDocument(document, activeTextEditor);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, edits[0].range, edits[0].newText);
        return vscode.workspace.applyEdit(edit);
    });
    // 注册格式化提供程序
    const formatterProvider = vscode.languages.registerDocumentFormattingEditProvider({ scheme: 'file', language: 'pug' }, {
        provideDocumentFormattingEdits: (document) => {
            return formatter.formatDocument(document, vscode.window.activeTextEditor);
        }
    });
    // 注册编译命令
    const compileDisposable = vscode.commands.registerCommand('pug-compile.compile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            compiler_1.PugCompiler.compile(editor.document.uri.fsPath);
        }
    });
    // 监听文件保存事件，用于自动编译
    const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'pug') {
            const config = vscode.workspace.getConfiguration('pug-compile');
            if (config.get('autoCompile')) {
                compiler_1.PugCompiler.compile(document.uri.fsPath);
            }
        }
    });
    // 注册到订阅列表以便正确清理
    context.subscriptions.push(formatDisposable, formatterProvider, compileDisposable, saveDisposable);
}
exports.activate = activate;
/**
 * 扩展被停用时调用
 */
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map