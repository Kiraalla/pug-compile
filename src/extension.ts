import * as fs from 'fs';
import * as path from 'path';
import * as pug from 'pug';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // 注册编译命令
  let compileDisposable = vscode.commands.registerCommand('pug-compile.compile', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      compilePugFile(editor.document.uri.fsPath);
    }
  });

  context.subscriptions.push(compileDisposable);

  // 监听文件保存事件
  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    if (document.languageId === 'pug') {
      const config = vscode.workspace.getConfiguration('pug-compile');
      if (config.get('autoCompile')) {
        compilePugFile(document.uri.fsPath);
      }
    }
  }, null, context.subscriptions);
}
function compilePugFile(filePath: string) {
  try {
    const config = vscode.workspace.getConfiguration('pug-compile');
    let outputPath = config.get<string>('outputPath') || '';
    const outputPathFormat = config.get<string>('outputPathFormat') || 'same';
    const pretty = config.get<boolean>('pretty') || false;

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
          } else {
            // 如果是相对路径，基于当前文件所在目录
            targetOutputPath = path.join(path.dirname(filePath), outputPath);
          }
          // 确保输出目录存在
          if (!fs.existsSync(targetOutputPath)) {
            fs.mkdirSync(targetOutputPath, { recursive: true });
          }
          finalOutputPath = path.join(targetOutputPath, `${fileNameWithoutExt}.html`);
        } else {
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
          } else {
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
            } else {
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
          } else {
            // 如果无法确定工作区，回退到默认行为
            finalOutputPath = filePath.replace(/\.pug$/, '.html');
          }
        } else {
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
  } catch (error) {
    vscode.window.showErrorMessage(`编译失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function deactivate() { }