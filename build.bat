@echo off

echo === compile ===
call yarn compile

echo === package ===
call yarn run vsce package -o dist

echo === install ===
call code --install-extension dist\mytools-1.0.0.vsix