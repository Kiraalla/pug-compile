import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class OutputPathResolver {
    static resolveSamePath(filePath: string): string {
        return filePath.replace(/\.pug$/, '.html');
    }

    static resolveCustomPath(filePath: string, outputPath: string): string {
        if (!outputPath) {
            return this.resolveSamePath(filePath);
        }

        let targetOutputPath: string;
        if (path.isAbsolute(outputPath)) {
            targetOutputPath = outputPath;
        } else {
            targetOutputPath = path.join(path.dirname(filePath), outputPath);
        }

        this.ensureDirectoryExists(targetOutputPath);
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
        return path.join(targetOutputPath, `${fileNameWithoutExt}.html`);
    }

    static resolveRelativePath(filePath: string, outputPath: string): string {
        if (!outputPath) {
            return this.resolveSamePath(filePath);
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (!workspaceFolder) {
            return this.resolveSamePath(filePath);
        }

        // 处理以/开头的相对路径
        if (outputPath.startsWith('/')) {
            outputPath = outputPath.substring(1);
        }

        // 基于工作区根目录
        const targetOutputPath = path.join(workspaceFolder.uri.fsPath, outputPath);
        this.ensureDirectoryExists(targetOutputPath);

        // 计算文件相对于工作区的路径
        const relativePath = path.relative(workspaceFolder.uri.fsPath, path.dirname(filePath));
        const newOutputDir = path.join(targetOutputPath, relativePath);
        this.ensureDirectoryExists(newOutputDir);

        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
        return path.join(newOutputDir, `${fileNameWithoutExt}.html`);
    }

    private static ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}
