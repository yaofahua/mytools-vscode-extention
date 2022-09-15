import {exec, spawn} from 'child_process';
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext)
{

    /**
     * 判断字符串是否为空或undefined,不判断为0,不判断为false
     * @param str
     * @returns {boolean}
     */
    function isEmpty(str: any): boolean
    {
        if (str === null || str === '' || str === undefined || str.length === 0) {
            return true
        } else {
            return false
        }
    };

    // 临时文件夹
    var tempDir = os.tmpdir();
    var tempFile = path.normalize(path.join(tempDir, 'mytools-temp.txt'));

    // 打开系统剪贴板中路径指向的文件
    context.subscriptions.push(vscode.commands.registerCommand('extension.my-openfile', async () => {
        const txt = await vscode.env.clipboard.readText();
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(txt));
        vscode.window.showTextDocument(doc);
    }));

    // markdown格式文本转化成mediawiki格式（当前编辑窗口 -> 剪贴板）
    context.subscriptions.push(vscode.commands.registerCommand('extension.my-md2mediawiki', async () => {
        // 当前编辑窗口
        var editor = vscode.window.activeTextEditor;
        if (editor == undefined) {
            return;
        }

        // 当前选定内容
        var selectText = editor.document.getText(editor.selection);
        if (isEmpty(selectText)) {
            return;
        }

        // 当前选定内容到临时文件
        fs.writeFileSync(tempFile, selectText);

        // pandoc转换
        var targetExec = 'pandoc --from markdown_github --to mediawiki ' + tempFile;
        var child = exec(targetExec, {cwd : tempDir}, function(error, stdout, stderr) {
            if (error != null) {
                vscode.window.showErrorMessage(error.message + '\n' + targetExec);
            } else if (stderr != null && stderr != '') {
                vscode.window.showErrorMessage(stderr + '\n' + targetExec);
            } else {
                vscode.env.clipboard.writeText(stdout);
                vscode.window.showInformationMessage("Convert success");
            }
        });
    }));

    // mediawiki格式文本转化成markdown格式（剪贴板 -> 剪贴板）
    context.subscriptions.push(vscode.commands.registerCommand('extension.my-mediawiki2md', async () => {

		// 系统剪贴板内容
		const txt = await vscode.env.clipboard.readText();
		if (isEmpty(txt)) {
			return;
		}

        // 剪贴板内容到临时文件
        fs.writeFileSync(tempFile, txt);

        // pandoc转换
        var targetExec = 'pandoc --from mediawiki --to gfm --wrap=none ' + tempFile;
        var child = exec(targetExec, {cwd : tempDir}, function(error, stdout, stderr) {
            if (error != null) {
                vscode.window.showErrorMessage(error.message + '\n' + targetExec);
            } else if (stderr != null && stderr != '') {
                vscode.window.showErrorMessage(stderr + '\n' + targetExec);
            } else {

                //              ```
                // **`Line1`**  Line1
                // `Line2` to   Line2
                // `Line3`      Line3
                //              ```
                var result = stdout.toString();
                result = result.replace(/`[\s\r\n*]*`/g, '\n');
                result = result.replace(/[*]*`/g, '\n```\n');

                vscode.env.clipboard.writeText(result);
                vscode.window.showInformationMessage("Convert success");
            }
        });
    }));
}
