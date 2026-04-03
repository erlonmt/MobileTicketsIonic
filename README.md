# Mobile Tickets Ionic

Sistema de emissão e atendimento de senhas com interface **Ionic + Angular**, API **Node.js (Express)** e persistência em **MySQL**.

## Equipe

| Nome                                   | Matrícula |
|----------------------------------------|----------|
| Erlon Matheus de Andrade Oliveira      | 01797598 |
| Cauã Vitor Oliveira Marques de Souza   | 01808325 |
| João Vitor de Santana Pereira          | 01794895 |

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Configuração do banco de dados](#configuração-do-banco-de-dados)
- [Como executar](#como-executar)
- [API REST](#api-rest)
- [Aplicativo (telas)](#aplicativo-telas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Scripts npm (frontend)](#scripts-npm-frontend)

## Visão geral

O projeto simula um fluxo de atendimento com três tipos de senha:

| Código | Significado       |
|--------|-------------------|
| `SG`   | Senha geral       |
| `SP`   | Senha prioritária |
| `SE`   | Senha para exame  |

**Na API (MySQL):** entre senhas com status `emitida`, a prioridade de chamada é `SP` → `SE` → `SG`. Dentro do mesmo tipo, vale ordem de chegada (**FIFO**), usando `id_senha ASC` na consulta.

**No aplicativo Ionic:** o `SenhaService` (`src/app/services/senhas.ts`) roda **só no navegador**, mantém filas em memória, regras alternadas conforme o último tipo chamado e métricas simuladas (tempo de atendimento). **Não há import de `mysql2` no frontend** — o bundle Angular não deve incluir o cliente MySQL.

Em resumo: as telas funcionam como **protótipo autônomo**; dados persistidos e a fila “oficial” vêm do **backend + MySQL** quando você usa a API (por exemplo via `curl` ou integração futura com `HttpClient`).

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│  Navegador / WebView (Ionic + Angular)                          │
│  • SenhaService: filas em memória, relatórios, tempos simulados │
│  • Não acessa MySQL diretamente                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
         (opcional) HTTP       │  hoje o app não consome a API por padrão
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express — backend/server.ts ou src/server.ts — porta 3000      │
│  • Rotas: /gerar-senha, /chamar-senha, /painel                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ mysql2 (pool)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  MySQL — banco `controle_atendimento`                           │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend:** `npm start` → `ng serve` (porta padrão **4200**). Alternativa: `ionic serve`.
- **Backend:** Express em **http://localhost:3000** (`backend/server.ts` ou `src/server.ts`).
- **Banco:** pool em `backend/database/connections.ts` (ajuste `host`, `user`, `password`, `database`).

## Requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado) e npm
- [MySQL](https://dev.mysql.com/doc/) em execução (local ou remoto)
- Opcional: [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)

## Configuração do banco de dados

1. Crie o banco e um usuário com permissão (ajuste nomes e senhas conforme seu ambiente).

2. Edite as credenciais em `backend/database/connections.ts`.

3. Crie as tabelas esperadas pela API. O arquivo `backend/database/controle_atendimento.sql` pode estar vazio; use o script de exemplo abaixo como base:

```sql
CREATE DATABASE IF NOT EXISTS controle_atendimento
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE controle_atendimento;

CREATE TABLE IF NOT EXISTS senha (
  id_senha INT AUTO_INCREMENT PRIMARY KEY,
  codigo_senha VARCHAR(255) NOT NULL,
  tipo ENUM('SP', 'SE', 'SG') NOT NULL,
  data_emissao DATE,
  hora_emissao TIME,
  status VARCHAR(32) NOT NULL DEFAULT 'emitida',
  sequencial_dia INT,
  id_cliente INT NULL,
  INDEX idx_status (status),
  INDEX idx_tipo (tipo)
);

CREATE TABLE IF NOT EXISTS painel_senhas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_senha INT NOT NULL,
  data_hora_chamada DATETIME NOT NULL,
  FOREIGN KEY (id_senha) REFERENCES senha(id_senha)
);
```

> **Nota:** na rota `POST /gerar-senha`, envie `id_cliente` conforme o seu modelo (número ou `null`).

## Como executar

### 1. Instalar dependências (raiz do repositório)

```bash
npm install
```

### 2. Subir o servidor Express

Na raiz (dependências `express`, `mysql2` e `ts-node` estão no `package.json` principal):

```bash
npx ts-node --project backend/tsconfig.json backend/server.ts
```

Confirme a mensagem indicando **http://localhost:3000**.

Há também `src/server.ts`, que reexporta as mesmas rotas por outro caminho de import.

### 3. Subir o aplicativo Ionic / Angular

Em outro terminal:

```bash
npm start
```

Abra **http://localhost:4200** (porta padrão do `ng serve`).

### Build de produção (frontend)

```bash
npm run build
```

Saída em `www/`.

## API REST

Base URL: `http://localhost:3000`

| Método | Rota            | Descrição |
|--------|-----------------|-----------|
| `POST` | `/gerar-senha`  | Cria senha com status `emitida`. Corpo JSON: `{ "tipo": "SP" \| "SE" \| "SG", "id_cliente": <número ou null> }`. |
| `GET`  | `/chamar-senha` | Próxima senha emitida: prioridade SP → SE → SG; empate no tipo resolve por **menor `id_senha`**. Atualiza para `chamada` e insere em `painel_senhas`. |
| `GET`  | `/painel`       | Últimas 5 chamadas (join `painel_senhas` + `senha`), por `data_hora_chamada` decrescente. |

Exemplos com [curl](https://curl.se/):

```bash
curl -X POST http://localhost:3000/gerar-senha \
  -H "Content-Type: application/json" \
  -d '{"tipo":"SP","id_cliente":1}'
```

```bash
curl http://localhost:3000/chamar-senha
```

```bash
curl http://localhost:3000/painel
```

Se o frontend passar a chamar essa API a partir do navegador (origem diferente da porta 3000), configure **CORS** no Express; o código atual não inclui o middleware `cors`.

## Aplicativo (telas)

Navegação por abas (`src/app/tabs/`):

| Aba        | Rota   | Função resumida |
|------------|--------|-----------------|
| Cliente    | `tab1` | Emissão de senha (Geral, Prioritária, Exame) — lógica em memória no `SenhaService`. |
| Atendente  | `tab2` | Chama a próxima senha da fila em memória; o **guichê** selecionado na tela é o usado na chamada e na lista de recentes. |
| Relatórios | `tab3` | Totais emitidos/atendidos, médias de tempo simuladas, últimas chamadas. |

Formato da senha gerada no cliente: `AAMMDD-TIPO###` (ex.: `260402-SP001`).

## Estrutura de pastas

```
MobileTicketsIonic/
├── backend/
│   ├── database/
│   │   ├── connections.ts      # Pool MySQL (só Node / API)
│   │   └── controle_atendimento.sql
│   ├── routes/
│   │   └── senhaRoutes.ts      # /gerar-senha, /chamar-senha, /painel
│   ├── server.ts
│   └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── services/senhas.ts  # SenhaService (memória; sem mysql no bundle)
│   │   ├── tab1/ tab2/ tab3/
│   │   └── tabs/
│   ├── controllers/
│   │   └── senhaController.ts  # Lógica de chamar senha (pode ser ligada ao Express)
│   └── server.ts               # Servidor Express alternativo
├── package.json
└── README.md
```

## Scripts npm (frontend)

| Script         | Comando                  |
|----------------|--------------------------|
| Desenvolvimento | `npm start` (`ng serve`) |
| Build          | `npm run build`          |
| Watch          | `npm run watch`          |
| Testes         | `npm test`               |
| Lint           | `npm run lint`           |

O diretório `backend/` pode ter um `package.json` próprio; scripts de `start`/`dev` do servidor podem ser adicionados na raiz ou em `backend/` conforme sua organização.

## Licença

Projeto acadêmico para fins de estudo.
