import * as fs from 'fs';
import * as path from 'path';
import * as pug from 'pug';
import * as vscode from 'vscode';
import { OutputPathResolver } from './pathResolver.js';
import { ErrorHandler } from './utils.js';

export interface CompileOptions {
    outputPath: string;
    outputPathFormat: 'same' | 'custom' | 'relative';
    pretty: boolean;
}

export class PugCompiler {
    private static getConfig(): CompileOptions {
        const config = vscode.workspace.getConfiguration('pug-compile');
        return {
            outputPath: config.get<string>('outputPath') || '',
            outputPathFormat: config.get<'same' | 'custom' | 'relative'>('outputPathFormat') || 'same',
            pretty: config.get<boolean>('pretty') || false
        };
    }

    private static getOutputPath(filePath: string, config: CompileOptions): string {
        switch (config.outputPathFormat) {
            case 'same':
                return OutputPathResolver.resolveSamePath(filePath);
            case 'custom':
                return OutputPathResolver.resolveCustomPath(filePath, config.outputPath);
            case 'relative':
                return OutputPathResolver.resolveRelativePath(filePath, config.outputPath);
            default:
                return OutputPathResolver.resolveSamePath(filePath);
        }
    }

    public static compile(filePath: string): void {
        try {
            const config = this.getConfig();
            const pugContent = fs.readFileSync(filePath, 'utf8');

            // 编译Pug为HTML
            const html = pug.compile(pugContent, {
                filename: filePath,
                pretty: config.pretty
            })();

            const finalOutputPath = this.getOutputPath(filePath, config);
            OutputPathResolver['ensureDirectoryExists'](path.dirname(finalOutputPath));
            fs.writeFileSync(finalOutputPath, html);

            ErrorHandler.showSuccess(`已成功编译 ${path.basename(filePath)} 到 ${finalOutputPath}`);
        } catch (error) {
            ErrorHandler.handleError(error, 'Pug编译');
        }
    }
}
