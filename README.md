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

## Estado atual

A Etapa 0 adiciona somente proteção e reprodutibilidade. O comportamento funcional e o layout do protótipo foram preservados. Consulte `docs/BASELINE.md` para os limites conhecidos.
