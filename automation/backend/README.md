# ⚡ Backend API - Ethyl Gas Tracker

API de alta performance construída com **FastAPI** para servir os dados tratados do monitoramento de combustíveis.

## 🚀 Stack Tecnológica

- **Python 3.10+**
- **FastAPI**: Framework moderno, rápido (high performance) e fácil de aprender.
- **SQLAlchemy**: ORM padrão para interação segura com o Banco de Dados.
- **Pydantic**: Validação de dados e serialização.
- **Uvicorn**: Servidor ASGI para produção.

## 📡 Endpoints Principais

A API expõe os seguintes endpoints REST:

### `/api/history`
Retorna o histórico de preços pivotado para construção de gráficos.
- **Parâmetros**: `limit`, `start_date`
- **Uso**: Gráficos de tendência Gasolina x Etanol.

### `/api/last-update`
Retorna metadados sobre a última atualização dos dados.
- **Retorno**: `{ "last_updated": "2024-02-15", "total_records": 5000 }`

### `/api/history/municipalities`
Endpoint otimizado para filtragem granular.
- **Filtros**: `product`, `state`, `region`, `start_date`, `end_date`
- **Uso**: Dashboard de comparação entre cidades.

## 🛡️ Segurança

A API foi auditada e protegida contra vulnerabilidades comuns:

- **SQL Injection**: Todas as consultas utilizam métodos seguros do ORM ou *parameter binding*.
- **CORS**: Configurado para aceitar requisições apenas do frontend autorizado (em produção).
- **Error Handling**: Middleware global para captura de erros sem expor stack traces sensíveis.

## 🏃 Como Rodar

```bash
# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor (Porta 8000)
uvicorn main:app --reload
```

Acesse a documentação interativa (Swagger UI) em: `http://localhost:8000/docs`
