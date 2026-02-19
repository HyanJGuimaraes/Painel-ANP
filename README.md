# ⛽ Ethyl Gas Tracker (Painel ANP)

![Status](https://img.shields.io/badge/Status-Production-green)
![Security](https://img.shields.io/badge/Security-Gold%20Standard-blue)
![Stack](https://img.shields.io/badge/Stack-T3%20%7C%20FastAPI%20%7C%20Postgres-blueviolet)

Um dashboard moderno e de alta performance para monitoramento de preços de combustíveis no Brasil, utilizando dados públicos da ANP (Agência Nacional do Petróleo).

## 🎯 Sobre o Projeto

Este projeto foi desenvolvido como um sistema completo de inteligência de mercado (BI), automatizando desde a coleta de dados até a visualização final para o usuário. 

O objetivo é permitir a análise de tendências de preços (Gasolina vs Etanol), paridade econômica e competitividade entre postos, municípios e regiões.

### ✨ Funcionalidades Principais
- **ETL Automatizado**: Crawler semanal que busca dados oficiais da ANP.
- **Dashboard Interativo**: Interface moderna (Glassmorphism) com filtros dinâmicos.
- **Análise Multi-Cidade**: Comparação de preços entre múltiplos municípios simultaneamente.
- **Sinal de Demanda**: Indicadores automáticos de "Compra Forte" ou "Venda/Cautela" baseados na paridade Etanol/Gasolina.
- **Segurança Padrão Ouro**: Auditoria completa de segurança (SQL Injection blindado, XSS protection).

---

## 🏗️ Arquitetura e Tecnologias

O projeto segue uma arquitetura moderna e desacoplada:

### Frontend (Client)
- **Framework**: React (Vite) + TypeScript
- **UI Kit**: Shadcn/UI + Tailwind CSS v3
- **Viz**: Recharts para gráficos de alta performance
- **State**: TanStack Query (React Query) para caching e sincronização

### Backend (API)
- **Framework**: FastAPI (Python) - Alta performance assíncrona
- **ORM**: SQLAlchemy - Gestão segura de banco de dados
- **Validation**: Pydantic - Schemas rigorosos de entrada/saída

### Data Pipeline (ETL)
- **Extraction**: Crawler customizado em Python (`requests` + `BeautifulSoup`)
- **Transformation**: Pandas para limpeza, normalização e pivotamento de dados
- **Loading**: Carga incremental inteligente no banco de dados (SQLite/Postgres)

---

## 🚀 Pipeline de Dados (O Crawler)

O coração do projeto é o sistema de automação que mantém os dados atualizados.

1.  **Extract**: O script acessa o portal da ANP, identifica a última planilha semanal (`.xlsx` ou `.csv`) e realiza o download.
2.  **Transform**: 
    - Limpeza de cabeçalhos e metadados.
    - Normalização de nomes de municípios e produtos.
    - Cálculo de colunas derivadas (Paridade, Diferencial).
3.  **Load**: Insere apenas novos registros no banco de dados, mantendo histórico sem duplicações.

> 👉 [Veja detalhes técnicos do Crawler em `automation/README.md`](automation/README.md)

---

## 🔒 Segurança e Governança

Este projeto passou por uma **Auditoria de Segurança (Gold Standard)** rigorosa.

- **SQL Injection**: Todas as queries do backend e scripts de automação utilizam *parameter binding* ou whitelisting estrito de tabelas.
- **XSS (Cross-Site Scripting)**: O frontend utiliza sanitização automática do React e evita injeções de HTML inseguro.
- **Dependências**: Análise de vulnerabilidades em pacotes externos.

> 👉 [Veja o relatório completo em `SECURITY_AUDIT.md`](SECURITY_AUDIT.md)

---

## 🏢 Guia de Desenvolvimento (Onboarding)

> ⚠️ **Nota**: Este projeto é uma ferramenta interna. As instruções abaixo destinam-se ao *setup* do ambiente de desenvolvimento para novos engenheiros do time.

### Pré-requisitos
- Node.js 18+ (LTS)
- Python 3.10+
- Acesso à VPN (se necessário para banco de produção)

### 1. Backend & Crawler (Ambiente Local)
```bash
# Clone o repositório
git clone https://github.com/seusrouser/ethyl-gas-tracker.git
cd ethyl-gas-tracker/automation

# Crie e ative o ambiente virtual (Recomendado)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Instale as dependências do projeto
pip install -r requirements.txt

# Setup Inicial (Criação do Banco de Dados Local)
python src/main.py

# Inicie a API de Desenvolvimento
cd backend
uvicorn main:app --reload
```

### 2. Frontend (Dashboard)
```bash
cd src
# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O dashboard estará disponível em `http://localhost:5173`. Para acessar o ambiente de *Staging* ou *Production*, consulte a wiki interna.

---

**Licença**: Este projeto é distribuído sob licença MIT para fins de demonstração de portfólio, mantendo créditos à equipe original.

