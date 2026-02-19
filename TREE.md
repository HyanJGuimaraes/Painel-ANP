# 📂 Estrutura do Projeto

```
ethyl-gas-tracker/
├── 📂 automation/              # Pipeline de Dados (Python)
│   ├── 📂 backend/             # API REST (FastAPI)
│   │   ├── main.py             # Entrypoint da API
│   │   ├── crud.py             # Lógica de Banco de Dados
│   │   ├── models.py           # Modelos SQLAlchemy
│   │   └── schemas.py          # Schemas Pydantic
│   ├── 📂 src/                 # Source do ETL
│   │   ├── 📂 etl/             # Módulos de Extração, Transformação e Carga
│   │   └── main.py             # Orquestrador do Crawler
│   └── requirements.txt        # Dependências Python
│
├── 📂 src/                     # Frontend (React + Vite)
│   ├── 📂 components/          # Componentes Reutilizáveis (UI)
│   ├── 📂 pages/               # Páginas da Aplicação (Licitacoes, Suprimentos)
│   ├── 📂 lib/                 # Utilitários (Formatadores, API Client)
│   └── main.tsx                # Entrypoint React
│
├── 📜 SECURITY_AUDIT.md        # Relatório de Auditoria de Segurança
├── 📜 README.md                # Documentação Principal
└── 📜 LICENSE                  # Licença do Projeto
```
