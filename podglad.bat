@echo off
rem Podglad strony GregWET: buduje strony i uruchamia lokalny serwer na http://localhost:4321
cd /d "%~dp0"
node src\build.mjs
start "" http://localhost:4321
node src\serve.mjs
