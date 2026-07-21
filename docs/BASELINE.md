# Baseline técnico — Etapa 0

Este arquivo registra a fundação de qualidade do frontend antes da modularização.

## Escopo desta etapa

- Nenhuma regra de negócio ou tela foi alterada.
- O projeto continua usando o `src/app/App.tsx` monolítico recebido do Figma Make.
- Foram adicionados lockfile, TypeScript, ESLint, Vitest e comandos reproduzíveis.
- O teste de fumaça confirma que a Home atual renderiza sem falhar.

## Ambiente suportado

- Node.js 22.16.0
- npm 10.9.2

## Comandos

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run check
```

`npm run check` executa typecheck, lint, testes e build na sequência.

## Limites conhecidos do baseline

- A navegação ainda é controlada por estado local, sem rotas reais.
- Autenticação, catálogo, orçamento e administração ainda usam dados mockados.
- Não há integração com o backend nesta etapa.
- O TypeScript permanece sem modo estrito para não misturar a Etapa 0 com a refatoração estrutural da Etapa 1.
