import * as vscode from 'vscode';

/**
 * 错误处理工具类
 */
export class ErrorHandler {
    /**
     * 统一处理错误并显示给用户
     * @param error 错误对象
     * @param operation 操作名称
     */
    static handleError(error: unknown, operation: string): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`${operation}失败: ${errorMessage}`);
    }

    /**
     * 显示成功消息
     * @param message 成功消息内容
     */
    static showSuccess(message: string): void {
        vscode.window.showInformationMessage(message);
    }
}
