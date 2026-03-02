# Dashboard Financeiro

Dashboard para gestão de ativos financeiros com persistência em **Netlify Blobs** (e fallback em **localStorage**), construído com **Next.js**, **React** e **Chakra UI**.

## Funcionalidades

- **Formulário de ativos (esquerda):**
  - Lista de ativos com nome e valor
  - **Editar**: ao clicar, os campos ficam editáveis e o botão muda para "Salvar"
  - **Remover**: exclui o ativo da lista
  - Campos no rodapé para **novo ativo** + botão "Novo ativo"

- **Gráfico de pizza (direita):**
  - Proporção em % de cada ativo
  - Nome e valor no tooltip e na legenda
  - Animação ao carregar/atualizar (Recharts)

- **Persistência:** em produção na Netlify os ativos são salvos no **Netlify Blobs** (acessíveis de qualquer dispositivo). Em desenvolvimento ou se a API falhar, os dados usam **localStorage**.

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deploy na Netlify

1. Conecte o repositório à Netlify (Site settings > Build & deploy).
2. O `netlify.toml` já configura o plugin Next.js; o build usa `npm run build`.
3. Após o deploy, os ativos passam a ser gravados no **Netlify Blobs** e ficam disponíveis em qualquer dispositivo (mobile, tablet, desktop).

Para testar localmente com Blobs (sandbox), use:

```bash
netlify dev
```

## Stack

- Next.js 14 (App Router)
- React 18
- Chakra UI 2
- Recharts (gráfico de pizza animado)
- Netlify Blobs (persistência em produção)
- TypeScript
