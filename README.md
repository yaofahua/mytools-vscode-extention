# mytools for VSCode

mytools集合了自己使用的一些工具。

## 开发

### 安装nodejs

下载地址：https://nodejs.org

### 安装依赖

```
yarn install
```

### 编译

```
yarn compile
```

## 打包

### 安装打包工具vsce

```
yarn global add vsce
```

### 打包

```
vsce package -o dist
```

成功的话，将在项目根目录生成mytools-***.vsix文件。

## 本地安装

```
code --install-extension dist\mytools-***.vsix
```

## VSCode 调试

用VSCode打开工程文件夹，修改代码后，`Run -> Start Debugging`

## 参考

- VSCode 插件开发（三）：插件打包与本地安装 https://www.jianshu.com/p/bb379a628004
- VSCode Extension API：https://code.visualstudio.com/api
- vscode插件开发教程：https://www.jianshu.com/p/e642856f6044
- Publishing Extensions：https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- package.json 指南：http://nodejs.cn/learn/the-package-json-guide/