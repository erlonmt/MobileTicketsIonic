# Mobile Tickets Ionic

Aplicativo mobile/web feito com Ionic + Angular para simular um sistema de emissao e atendimento de senhas em guiche.

## Visao geral

O projeto implementa um fluxo simples de fila com tres tipos de senha:

- `SG` - Senha Geral
- `SP` - Senha Prioritaria
- `SE` - Senha para Exame

Cada senha emitida segue o formato:

`AAMMDD-TIPO###`

Exemplo:

`260402-SP001`

## Funcionalidades principais

### 1) Emissao de senhas (Cliente)

Na aba **Cliente**, o usuario pode gerar senhas dos tres tipos (`SG`, `SP`, `SE`).

- A senha mais recente aparece em destaque na tela.
- O sistema incrementa contadores por tipo e total de emissoes.
- Cada emissao fica registrada com data/hora.

### 2) Chamada de senhas (Atendente)

Na aba **Atendente**, o usuario:

- escolhe o guiche (`1`, `2` ou `3`);
- chama a proxima senha da fila;
- visualiza as ultimas chamadas.

Regras de selecao da proxima senha:

- na primeira chamada, prioridade para `SP`, depois `SE`, depois `SG`;
- se a ultima chamada foi `SP`, a proxima tenta `SE`, depois `SG`, depois `SP`;
- caso contrario, tenta `SP`, depois `SE`, depois `SG`.

Observacao:

- Existe uma simulacao de "falta": com ~5% de chance, uma senha chamada e ignorada e o sistema chama a proxima automaticamente.

### 3) Relatorios e estatisticas

Na aba **Relatorios**, o app exibe:

- total de senhas emitidas;
- quantidade emitida por tipo;
- total de atendimentos;
- total atendido por tipo;
- media de tempo de atendimento por tipo;
- ultimas senhas chamadas.

## Regras de negocio de tempo de atendimento

Tempo gerado por tipo (em minutos):

- `SP`: entre `10` e `20`;
- `SG`: entre `2` e `8`;
- `SE`: `1` minuto em 95% dos casos, e `5` minutos em 5% dos casos.

## Tecnologias utilizadas

- [Ionic Framework](https://ionicframework.com/) `8`
- [Angular](https://angular.io/) `20`
- [Capacitor](https://capacitorjs.com/) `8`
- TypeScript
- SCSS

## Estrutura de telas

O app usa navegacao por abas (`tabs`):

- **Cliente** (`tab1`) - emissao de senhas;
- **Atendente** (`tab2`) - chamada e painel operacional;
- **Relatorios** (`tab3`) - indicadores e historico recente.

## Estrutura tecnica (resumo)

Arquivos principais:

- `src/app/services/senhas.ts`  
  Servico central com toda a logica de fila, emissoes, chamadas, tempos e metricas.
- `src/app/tab1/*`  
  Interface de emissao de senha para cliente.
- `src/app/tab2/*`  
  Interface de chamada de senha para atendente.
- `src/app/tab3/*`  
  Interface de relatorios.
- `src/app/tabs/*`  
  Configuracao das abas e navegacao principal.

## Como executar o projeto

### Pre-requisitos

- Node.js (LTS recomendado)
- npm
- Ionic CLI (opcional, mas recomendado)

Instalacao da CLI:

```bash
npm install -g @ionic/cli
```

### Instalacao

```bash
npm install
```

### Rodar em modo desenvolvimento

```bash
npm start
```

Ou, se preferir usando Ionic:

```bash
ionic serve
```

### Build de producao

```bash
npm run build
```

### Executar testes

```bash
npm test
```

### Executar lint

```bash
npm run lint
```

## Scripts disponiveis

- `npm start` - inicia servidor de desenvolvimento (`ng serve`)
- `npm run build` - gera build de producao
- `npm run watch` - build continuo em modo desenvolvimento
- `npm test` - executa testes unitarios
- `npm run lint` - executa analise estatica

## Melhorias futuras sugeridas

- persistencia de dados (LocalStorage, SQLite ou backend);
- definicao real de guiche no registro do atendimento;
- autenticacao por perfil (cliente/atendente/admin);
- exportacao de relatorios (CSV/PDF);
- testes automatizados cobrindo regras de prioridade da fila.

## Licenca

Projeto academico para fins de estudo.
