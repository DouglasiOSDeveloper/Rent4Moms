# Rent4Moms Frontend

Frontend da plataforma Rent4Moms, atualmente baseado no protótipo exportado pelo Figma Make.

## Requisitos

- Node.js 22.16.0
- npm 10.9.2

Use o arquivo `.nvmrc` para alinhar a versão do Node.

## Instalação

```bash
npm ci
```

## Desenvolvimento

```bash
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação em `http://localhost:5173`.

## Qualidade

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Para executar toda a validação do baseline:

```bash
npm run check
```

## Configuração

Copie `.env.example` para `.env.local` quando a integração com o backend for iniciada.

## Etapa A — congelamento de dados

Antes da remoção dos mocks, gere o inventário e valide que nenhum novo consumidor runtime foi adicionado:

```bash
npm run stage:a:inventory
npm run guard:no-new-runtime-mocks
```

Consulte `docs/STAGE_A.md` e `docs/DATA_ORIGIN_INVENTORY.md`. A remoção efetiva dos mocks pertence à Etapa B.

## Ajuda operacional

A documentação da administração fica em `docs/OPERATIONS_GUIDE.md`, `docs/STATUS_GLOSSARY.md` e `docs/RUNBOOKS.md`. O painel também oferece a rota protegida `/admin/ajuda` e ajuda contextual em cada tela.

Validação da Etapa I:

```bash
npm run stage:i:verify
```
