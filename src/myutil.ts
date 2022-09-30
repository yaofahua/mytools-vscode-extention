import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

// 读取文件的逻辑拉出
export function fsReadDir(dir: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

// 获取fs.stats的逻辑拉出
function fsStat(path: string) {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path, (err, stat) => {
      if (err) reject(err);
      resolve(stat);
    });
  });
}

// 搜索文件主方法
export async function fileSearch(
  dirPath: string,
  rootOnly: boolean,
  includeFile: boolean,
  includeFolder: boolean
) {
  const files = await fsReadDir(dirPath);
  const promises = files.map((file) => {
    return fsStat(path.join(dirPath, file));
  });
  const datas = await Promise.all(promises).then((stats) => {
    for (let i = 0; i < files.length; i += 1)
      files[i] = path.join(dirPath, files[i]);
    return { stats, files };
  });

  let ret: string[] = [];

  for (let i = 0; i < datas.stats.length; i++) {
    const stat = datas.stats[i];

    const isFile = stat.isFile();
    const isDir = stat.isDirectory();
    if (isDir && !rootOnly) {
      const ret2 = await fileSearch(
        datas.files[datas.stats.indexOf(stat)],
        rootOnly,
        includeFile,
        includeFolder
      );
      ret = ret.concat(ret2);
    }

    if (isFile && includeFile) ret.push(datas.files[datas.stats.indexOf(stat)]);

    if (isDir && includeFolder)
      ret.push(datas.files[datas.stats.indexOf(stat)]);
  }

  return ret;
}

export function getMyTerminal(): vscode.Terminal {
  let term: vscode.Terminal | undefined;
  for (const terminal of vscode.window.terminals) {
    if (terminal.name == "mytools") {
      term = terminal;
      break;
    }
  }

  if (term == undefined) {
    term = vscode.window.createTerminal("mytools");
  }

  return term;
}
