import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as util from "./myutil";

export function activate(context: vscode.ExtensionContext) {
  // just for test
  registerCommandTest(context);

  // 打开系统剪贴板中路径指向的文件
  registerCommandOpenFile(context);

  // mediawiki格式文本转化成markdown格式
  registerCommandMediawikiToMarkdown(context);

  // 创建临时文件
  registerCommandCreateAndOpenTempFile(context);

  // 打开指定目录的文件或文件夹
  registerCommandOpenFaviFilesOrFolder(context);

  // 用Fork打开文件夹
  registerCommandOpenWithFork(context);

  // 用Dopus打开文件夹
  registerCommandOpenWithDopus(context);

  // 用vscode打开文件夹
  registerCommandOpenWithVscode(context);

  // 用MobaXterm打开文件夹
  registerCommandOpenWithMobaXterm(context);
}

/**
 * 判断字符串是否为空或undefined,不判断为0,不判断为false
 * @param str
 * @returns {boolean}
 */
function isEmpty(str: any): boolean {
  if (str === null || str === "" || str === undefined || str.length === 0) {
    return true;
  } else {
    return false;
  }
}

function registerCommandTest(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mytools.test",
      async (fileUri: vscode.Uri) => {

        console.log('mytools.test start');
        
        console.log('mytools.test end');
      }
    )
  );
}

function registerCommandFormatFolder(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mytools.formatFolder",
      async (fileUri: vscode.Uri) => {

        // 查找所有文件
        const files = await util.fileSearch(
          fileUri.fsPath,
          false,
          true,
          false
        );

        // 遍历文件
        for (const element of files) {
          console.log("Format: ", element);

          // 打开文件
          const doc = await vscode.workspace.openTextDocument(
            vscode.Uri.file(element)
          );
          await vscode.window.showTextDocument(doc);

          // 格式化文件
          await vscode.commands.executeCommand("prettier.forceFormatDocument");

          // 保存并关闭文件
          await doc.save();
          await vscode.commands.executeCommand(
            "workbench.action.closeActiveEditor"
          );
        }
      }
    )
  );
}

function registerCommandOpenWithFork(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mytools.openWithFork",
      (fileUri: vscode.Uri) => {
        util.getMyTerminal().sendText("fork " + fileUri.fsPath);
      }
    )
  );
}

function registerCommandOpenWithMobaXterm(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mytools.openWithMobaXterm",
      (fileUri: vscode.Uri) => {
        util.getMyTerminal().sendText("moba " + fileUri.fsPath);
      }
    )
  );
}

function registerCommandOpenWithDopus(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mytools.openWithDopus",
      (fileUri: vscode.Uri) => {
        util.getMyTerminal().sendText("dopus " + fileUri.fsPath);
      }
    )
  );
}

function registerCommandOpenWithVscode(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mytools.openWithVsCode",
      (fileUri: vscode.Uri) => {
        util.getMyTerminal().sendText("code " + fileUri.fsPath);
      }
    )
  );
}

function registerCommandOpenFaviFilesOrFolder(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.commands.registerCommand("mytools.openFaviFileOrFolder", async () => {
      //
      // 关注的路径，true表示递归子目录且只找文件，false表示只查找一级文件夹
      //
      const paths = [
        ["C:\\Users\\hw\\Desktop\\mydoc\\docs\\", true],
        ["C:\\Users\\hw\\Desktop\\src\\", false],
      ];

      // 所有指定的文件及文件夹
      let filesOrFolders: string[] = [];
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        // 递归子目录的所有文件
        if (path[1]) {
          const files = await util.fileSearch(
            <string>path[0],
            false,
            true,
            false
          );
          filesOrFolders = filesOrFolders.concat(files);
        } else {
          // 只查找一级文件夹
          const files2 = await util.fileSearch(
            <string>path[0],
            true,
            false,
            true
          );
          filesOrFolders = filesOrFolders.concat(files2);
        }
      }

      // 快速选择
      const fileOrFolder = await vscode.window.showQuickPick(filesOrFolders);

      // 当前窗口打开文件，新窗口打开文件夹
      const stat = fs.statSync(<string>fileOrFolder);
      if (stat.isFile()) {
        const doc = await vscode.workspace.openTextDocument(
          vscode.Uri.file(<string>fileOrFolder)
        );
        vscode.window.showTextDocument(doc);
      } else if (stat.isDirectory()) {
        util.getMyTerminal().sendText(`code ${fileOrFolder}`);
      }
    })
  );
}

function registerCommandOpenMemoFile(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.my-openMemoFile", async () => {
      const memoFilePath = "C:\\Users\\hw\\Desktop\\";

      // 打开文件
      let doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(memoFilePath + "memo.txt")
      );
      vscode.window.showTextDocument(doc);

      doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(memoFilePath + "1.txt")
      );
      vscode.window.showTextDocument(doc);

      doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(memoFilePath + "2.txt")
      );
      vscode.window.showTextDocument(doc);
    })
  );
}

function registerCommandCreateAndOpenTempFile(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.commands.registerCommand("mytools.createTempFile", async () => {
      // 临时文件名
      const tempFileName =
        (await vscode.window.showInputBox({ placeHolder: "Temp file name" })) ||
        "";
      if (isEmpty(tempFileName)) {
        return;
      }

      const tempFilePath = path.normalize(path.join(os.tmpdir(), tempFileName));

      // 若不存在就生成
      if (!fs.existsSync(tempFileName)) {
        fs.writeFileSync(tempFilePath, "");
      }

      // 打开文件
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(tempFilePath)
      );
      vscode.window.showTextDocument(doc);
    })
  );
}

function registerCommandOpenFile(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("mytools.openfile", async () => {
      const txt = await vscode.env.clipboard.readText();
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(txt));
      vscode.window.showTextDocument(doc);
    })
  );
}

function registerCommandMarkdownToMediawiki(context: vscode.ExtensionContext) {
  // 临时文件夹
  const tempDir = os.tmpdir();
  const tempFile = path.normalize(path.join(tempDir, "mytools-temp.txt"));

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.my-md2mediawiki", async () => {
      // 系统剪贴板内容
      const txt = await vscode.env.clipboard.readText();
      if (isEmpty(txt)) {
        return;
      }

      // 剪贴板内容到临时文件
      fs.writeFileSync(tempFile, txt);

      // pandoc转换
      const targetExec = "pandoc --from gfm --to mediawiki " + tempFile;
      const child = exec(
        targetExec,
        { cwd: tempDir },
        function (error, stdout, stderr) {
          if (error != null) {
            vscode.window.showErrorMessage(error.message + "\n" + targetExec);
          } else if (stderr != null && stderr != "") {
            vscode.window.showErrorMessage(stderr + "\n" + targetExec);
          } else {
            vscode.env.clipboard.writeText(stdout);
            vscode.window.showInformationMessage("Convert success");
          }
        }
      );
    })
  );
}

function registerCommandMediawikiToMarkdown(context: vscode.ExtensionContext) {
  // 临时文件夹
  const tempDir = os.tmpdir();
  const tempFile = path.normalize(path.join(tempDir, "mytools-temp.txt"));

  context.subscriptions.push(
    vscode.commands.registerCommand("mytools.mediawiki2md", async () => {
      // 系统剪贴板内容
      let txt = await vscode.env.clipboard.readText();
      if (isEmpty(txt)) {
        return;
      }

      txt = txt.replace(/</g, "ASDFGHJ");
      txt = txt.replace(/>/g, "JHGFDSA");

      // 剪贴板内容到临时文件
      fs.writeFileSync(tempFile, txt);

      // pandoc转换
      const targetExec =
        "pandoc --from mediawiki --to gfm --wrap=none " + tempFile;
      const child = exec(
        targetExec,
        { cwd: tempDir },
        function (error, stdout, stderr) {
          if (error != null) {
            vscode.window.showErrorMessage(error.message + "\n" + targetExec);
          } else if (stderr != null && stderr != "") {
            vscode.window.showErrorMessage(stderr + "\n" + targetExec);
          } else {
            //              ```
            // **`Line1`**  Line1
            // `Line2` to   Line2
            // `Line3`      Line3
            //              ```
            let result = stdout.toString();
            result = result.replace(/`[\s\r\n*]*`/g, "\n");
            result = result.replace(/[*]*`/g, "\n```\n");

            result = result.replace(/ASDFGHJ/g, "<");
            result = result.replace(/JHGFDSA/g, ">");

            vscode.env.clipboard.writeText(result);
            vscode.window.showInformationMessage("Convert success");
          }
        }
      );
    })
  );
}
