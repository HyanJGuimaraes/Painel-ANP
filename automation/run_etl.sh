#!/bin/bash
# script_name: run_etl.sh
# description: Runs ANP automation on Linux servers

# Validate directory
cd "$(dirname "$0")"

# Activate venv if it exists, otherwise assume running in container
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "[INFO] Starting ETL Pipeline..."
python src/main.py
