import * as vscode from 'vscode';
import * as path from 'path';
import {spawn, exec} from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	
	// open file with path in clipboard
	const disposable = vscode.commands.registerCommand('extension.my-openfile', async () => {

		const txt = await vscode.env.clipboard.readText();
		const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(txt));
		vscode.window.showTextDocument(doc);
	});

	context.subscriptions.push(disposable);

	// markdown to mediawiki use pandoc
	const disposable2 = vscode.commands.registerCommand('extension.my-md2mediawiki', async () => {

		var editor = vscode.window.activeTextEditor;
		if (editor == undefined) {
			return;
		}

		var fullName = path.normalize(editor.document.fileName);
		var filePath = path.dirname(fullName);
		var targetExec = 'pandoc -s -t mediawiki --toc ' + fullName;

		var child = exec(targetExec, { cwd: filePath }, function(error, stdout, stderr) {

			if (error != null) {
				vscode.window.showErrorMessage(error.message + "\n" + targetExec);
			} else if (stderr != null && stderr != '') {
				vscode.window.showErrorMessage(stderr + "\n" + targetExec);
			} else {
				vscode.env.clipboard.writeText(stdout);
				vscode.window.showInformationMessage("Convert success");
			}
		});
	});

	context.subscriptions.push(disposable2);
}
