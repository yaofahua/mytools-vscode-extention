import {exec, spawn} from 'child_process';
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext)
{
    // 打开系统剪贴板中路径指向的文件
    registerCommandOpenFile(context);

    // markdown格式文本转化成mediawiki格式
    registerCommandMarkdownToMediawiki(context);

    // mediawiki格式文本转化成markdown格式
    registerCommandMediawikiToMarkdown(context)

    // 创建临时文件
    registerCommandCreateAndOpenTempFile(context)

    // 打开memo.txt 1.txt 2.txt
    registerCommandOpenMemoFile(context)
}

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

function registerCommandOpenMemoFile(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('extension.my-openMemoFile', async () => {

        const memoFilePath = "C:\\Users\\hw\\Desktop\\";

        // 打开文件
        var doc = await vscode.workspace.openTextDocument(vscode.Uri.file(memoFilePath + 'memo.txt'));
        vscode.window.showTextDocument(doc);

        doc = await vscode.workspace.openTextDocument(vscode.Uri.file(memoFilePath + '1.txt'));
        vscode.window.showTextDocument(doc);

        doc = await vscode.workspace.openTextDocument(vscode.Uri.file(memoFilePath + '2.txt'));
        vscode.window.showTextDocument(doc);
   }));
}

function registerCommandCreateAndOpenTempFile(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('extension.my-createTempFile', async () => {

        // 临时文件名
        const tempFileName = await vscode.window.showInputBox({ placeHolder: "Temp file name" }) || "";
        if (isEmpty(tempFileName)) {
            return;
        }

        var tempFilePath = path.normalize(path.join(os.tmpdir(), tempFileName));

        // 若不存在就生成
        if (!fs.existsSync(tempFileName)) {
            fs.writeFileSync(tempFilePath, "");
        }

        // 打开文件
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tempFilePath));
        vscode.window.showTextDocument(doc);
    }));
}

function registerCommandOpenFile(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('extension.my-openfile', async () => {
        const txt = await vscode.env.clipboard.readText();
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(txt));
        vscode.window.showTextDocument(doc);
    }));
}

function registerCommandMarkdownToMediawiki(context: vscode.ExtensionContext)
{
    // 临时文件夹
    var tempDir = os.tmpdir();
    var tempFile = path.normalize(path.join(tempDir, 'mytools-temp.txt'));

    context.subscriptions.push(vscode.commands.registerCommand('extension.my-md2mediawiki', async () => {
		// 系统剪贴板内容
		const txt = await vscode.env.clipboard.readText();
		if (isEmpty(txt)) {
			return;
		}

        // 剪贴板内容到临时文件
        fs.writeFileSync(tempFile, txt);

        // pandoc转换
        var targetExec = 'pandoc --from gfm --to mediawiki ' + tempFile;
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
}

function registerCommandMediawikiToMarkdown(context: vscode.ExtensionContext)
{
    // 临时文件夹
    var tempDir = os.tmpdir();
    var tempFile = path.normalize(path.join(tempDir, 'mytools-temp.txt'));

    context.subscriptions.push(vscode.commands.registerCommand('extension.my-mediawiki2md', async () => {

		// 系统剪贴板内容
		var txt = await vscode.env.clipboard.readText();
		if (isEmpty(txt)) {
			return;
		}

        txt = txt.replace(/</g, 'ASDFGHJ');
        txt = txt.replace(/>/g, 'JHGFDSA');

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

                result = result.replace(/ASDFGHJ/g, '<');
                result = result.replace(/JHGFDSA/g, '>');
        
                vscode.env.clipboard.writeText(result);
                vscode.window.showInformationMessage("Convert success");
            }
        });
    }));
}

 
