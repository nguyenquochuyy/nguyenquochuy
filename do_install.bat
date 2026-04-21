@echo off
npm install > install_log.txt 2>&1
echo Exit: %errorlevel% >> install_log.txt
type install_log.txt
del install_log.txt
