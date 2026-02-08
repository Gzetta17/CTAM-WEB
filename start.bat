@echo off

echo Iniciando el servidor de backend...
start cmd /k "cd backend && node server.js"

echo Iniciando el servidor de frontend...
start cmd /k "python -m http.server"

echo ¡Servidores iniciados!
