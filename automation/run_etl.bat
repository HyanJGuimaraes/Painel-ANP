@echo off
:: script_name: run_etl.bat
:: description: Executa a automacao ANP (Extract -> Transform -> Load)
:: author: Agent Lyra

:: 1. Entra na pasta onde este arquivo esta salvo
cd /d "%~dp0"

:: 2. Ativa o ambiente virtual Python
call .venv\Scripts\activate

:: 3. Executa o script principal
echo [INFO] Iniciando ETL...
python src\main.py

:: 4. (Opcional) Mantem a janela aberta por 5 segundos para ver erros se rodar manual
if "%1" neq "auto" timeout /t 5
