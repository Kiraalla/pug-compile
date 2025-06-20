import * as vscode from 'vscode';
import { PugCompiler } from './modules/compiler';
import { PugFormatter } from './modules/formatter';

let outputChannel: vscode.OutputChannel;

/**
 * 扩展被激活时调用
 */
export async function activate(context: vscode.ExtensionContext) {
    // 创建输出通道
    outputChannel = vscode.window.createOutputChannel('Pug Compile');
    outputChannel.appendLine('Pug Compile extension is being activated...');
    outputChannel.show();

    try {
        const formatter = new PugFormatter();

        // 创建状态栏项
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = "$(code) Pug";
        statusBarItem.tooltip = "Pug Compile Active";
        context.subscriptions.push(statusBarItem);

        // 注册编译命令
        outputChannel.appendLine('Registering compile command...');
        const compileCommand = vscode.commands.registerCommand('pug-compile.compile', async () => {
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
                await PugCompiler.compile(editor.document.uri.fsPath);
                vscode.window.showInformationMessage('Pug file compiled successfully');
            } catch (error) {
                outputChannel.appendLine(`Error during compilation: ${error}`);
                vscode.window.showErrorMessage(`Failed to compile: ${error}`);
            }
        });

        // 注册格式化命令
        outputChannel.appendLine('Registering format command...');
        const formatCommand = vscode.commands.registerCommand('pug-compile.format', async () => {
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
                await vscode.workspace.applyEdit(edit);
                vscode.window.showInformationMessage('Pug file formatted');
            } catch (error) {
                outputChannel.appendLine(`Error during formatting: ${error}`);
                vscode.window.showErrorMessage(`Failed to format: ${error}`);
            }
        });

        // 注册格式化提供程序
        const formatterProvider = vscode.languages.registerDocumentFormattingEditProvider('pug', {
            provideDocumentFormattingEdits: (document: vscode.TextDocument) => {
                return formatter.formatDocument(document, vscode.window.activeTextEditor);
            }
        });

        // 监听文件保存事件
        const saveListener = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
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
                    PugCompiler.compile(document.uri.fsPath);
                }
            }
        });

        // 注册文件打开事件
        const openListener = vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
            if (document.languageId === 'pug') {
                outputChannel.appendLine(`Pug file opened: ${document.uri.fsPath}`);
                statusBarItem.show();
            }
        });

        // 将所有注册项添加到订阅中
        context.subscriptions.push(
            compileCommand,
            formatCommand,
            formatterProvider,
            saveListener,
            openListener,
            outputChannel
        );

        // 如果当前打开的是pug文件，显示状态栏
        if (vscode.window.activeTextEditor?.document.languageId === 'pug') {
            statusBarItem.show();
        }

        outputChannel.appendLine('Pug Compile extension activated successfully');
        vscode.window.showInformationMessage('Pug Compile extension is now active');

    } catch (error) {
        outputChannel.appendLine(`Error during activation: ${error}`);
        console.error('Failed to activate extension:', error);
        throw error;
    }
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('Pug Compile extension is being deactivated...');
        outputChannel.dispose();
    }
}