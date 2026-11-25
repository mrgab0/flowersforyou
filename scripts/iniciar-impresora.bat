@echo off
title Daemon Impresora Star TSP100 - Flowers For You
echo ========================================================
echo    FLOWERS FOR YOU - SERVICIO DE IMPRESION STAR POS
echo ========================================================
echo Iniciando daemon en segundo plano...
node "%~dp0star-pos-daemon.js"
pause
