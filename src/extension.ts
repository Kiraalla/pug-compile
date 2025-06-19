import * as vscode from 'vscode';
import { PugCompiler } from './modules/compiler';
import { PugFormatter } from './modules/formatter';

/**
 * 扩展被激活时调用
 */
export function activate(context: vscode.ExtensionContext) {
    const formatter = new PugFormatter();

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
    const formatterProvider = vscode.languages.registerDocumentFormattingEditProvider(
        { scheme: 'file', language: 'pug' },
        {
            provideDocumentFormattingEdits: (document: vscode.TextDocument) => {
                return formatter.formatDocument(document, vscode.window.activeTextEditor);
            }
        }
    );

    // 注册编译命令
    const compileDisposable = vscode.commands.registerCommand('pug-compile.compile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            PugCompiler.compile(editor.document.uri.fsPath);
        }
    });

    // 监听文件保存事件，用于自动编译
    const saveDisposable = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        if (document.languageId === 'pug') {
            const config = vscode.workspace.getConfiguration('pug-compile');
            if (config.get('autoCompile')) {
                PugCompiler.compile(document.uri.fsPath);
            }
        }
    });

    // 注册到订阅列表以便正确清理
    context.subscriptions.push(
        formatDisposable,
        formatterProvider,
        compileDisposable,
        saveDisposable
    );
}

/**
 * 扩展被停用时调用
 */
export function deactivate() { }