import pugBeautify, { BeautifyOptions } from 'pug-beautify';
import * as vscode from 'vscode';
import { ErrorHandler } from './utils.js';

export class PugFormatter {
    private getOptions(activeTextEditor: vscode.TextEditor): BeautifyOptions {
        const editorConfig = vscode.workspace.getConfiguration('pug-compile.format');
        const defaultTabSize = 4; // 默认制表符大小
        let editorTabSize = defaultTabSize;
        
        // 获取编辑器的制表符大小设置
        const vsCodeTabSize = activeTextEditor.options.tabSize;
        if (typeof vsCodeTabSize === 'number') {
            editorTabSize = vsCodeTabSize;
        }

        // 获取用户配置的制表符大小
        const configTabSize = editorConfig.get<number>('tabSize');
        if (typeof configTabSize === 'number' && configTabSize > 0) {
            editorTabSize = configTabSize;
        }

        return {
            fill_tab: editorConfig.get<boolean>('fillTab') ?? !activeTextEditor.options.insertSpaces,
            omit_div: editorConfig.get<boolean>('omitDiv') ?? false,
            tab_size: editorTabSize
        };
    }

    private getRange(document: vscode.TextDocument): vscode.Range {
        const lastLine = document.lineAt(document.lineCount - 1);
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
        return new vscode.Range(start, end);
    }

    public beautify(text: string, options: BeautifyOptions): string {
        try {
            const result = pugBeautify(text, options);
            return result || text;
        } catch (err) {
            ErrorHandler.handleError(err, 'Pug格式化');
            return text;
        }
    }

    public formatDocument(document: vscode.TextDocument, activeTextEditor: vscode.TextEditor | undefined): vscode.TextEdit[] {
        if (!activeTextEditor) {
            return [];
        }

        const text = document.getText();
        const options = this.getOptions(activeTextEditor);
        const result = this.beautify(text, options);
        const range = this.getRange(document);
        
        return [vscode.TextEdit.replace(range, result)];
    }
}
