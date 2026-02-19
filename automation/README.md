# 🤖 Pipeline de Automação (ETL) - Ethyl Gas Tracker

Esta pasta contém o ecossistema de engenharia de dados do projeto. É responsável por buscar, tratar e disponibilizar os dados de combustíveis da ANP.

## 🔄 Fluxo de Trabalho (ETL)

O pipeline segue o padrão clássico **Extract-Transform-Load**:

### 1. Extract (`src/etl/extract.py`)
- Conecta ao site oficial da ANP (Gov.br).
- Faz o *scraping* da página para encontrar o link da "Série Histórica Semanal".
- Baixa o arquivo `.xlsx` ou `.csv` mais recente.
- **Desafio resolvido**: O site da ANP muda frequentemente de layout. O extrator usa seletores robustos e *headers* de *User-Agent* para evitar bloqueios.

### 2. Transform (`src/etl/transform.py`)
- Carrega os dados brutos em memória usando **Pandas**.
- Renomeia colunas para o padrão do banco de dados (Snake Case).
- Filtra apenas os produtos de interesse: Gasolina Comum, Etanol Hidratado, Diesel S10.
- Normaliza datas e valores numéricos (conversão de vírgula para ponto).

### 3. Load (`src/etl/load.py`)
- Conecta ao banco de dados via **SQLAlchemy**.
- Verifica se os dados já existem para evitar duplicações.
- Realiza a carga incremental (apenas novas semanas).
- **Segurança**: Implementa *Table Whitelisting* para prevenir SQL Injection dinâmica.

## 📂 Estrutura de Arquivos

```
automation/
├── src/
│   ├── etl/
│   │   ├── extract.py      # Crawler
│   │   ├── transform.py    # Limpeza de dados
│   │   └── load.py         # Persistência no BD
│   └── main.py             # Orquestrador do ETL
├── backend/                # API FastAPI (consome os dados gerados)
└── requirements.txt        # Dependências Python
```

## 🛠️ Como Executar o ETL

Para forçar uma atualização manual dos dados:

```bash
# Na raiz do projeto
cd automation
python src/main.py
```

O script irá baixar a planilha mais recente, processar e atualizar o arquivo `ethyl.db` (SQLite) ou o banco Postgres configurado via `.env`.
