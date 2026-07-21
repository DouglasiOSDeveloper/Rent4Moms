# Etapa 1 — Modularização e rotas reais

## Objetivo

Separar o protótipo monolítico em módulos de aplicação e trocar a navegação por estado interno por URLs reais, sem alterar as regras de negócio ou o visual existente.

## Resultado

- `src/app/App.tsx` passou a conter somente os providers e o roteador.
- O estado compartilhado provisório foi movido para `src/app/providers.tsx`.
- As rotas públicas, da conta e administrativas estão em `src/app/router.tsx`.
- Os guards de cliente e administrador estão em `src/app/guards/RequireRole.tsx`.
- Tipos, dados mockados, componentes, layouts e páginas foram extraídos para módulos próprios.
- O produto usa rota dinâmica em `/produtos/:productId`.
- A URL passa a representar a tela atual e pode ser atualizada diretamente no navegador.

## Rotas principais

| Área | URL |
| --- | --- |
| Início | `/` |
| Catálogo | `/produtos` |
| Produto | `/produtos/:productId` |
| Orçamento | `/orcamento` |
| Login | `/entrar` |
| Conta | `/minha-conta` |
| Administração | `/admin` |

As demais URLs estão centralizadas em `src/app/navigation.ts`.

## Estrutura criada

```text
src/
├─ app/
│  ├─ App.tsx
│  ├─ navigation.ts
│  ├─ providers.tsx
│  ├─ router.tsx
│  └─ guards/RequireRole.tsx
├─ components/
│  ├─ layout/
│  └─ prototype/
├─ data/mocks/
├─ domain/shared/
└─ features/
   ├─ account/
   ├─ admin/
   ├─ auth/
   ├─ catalog/
   ├─ home/
   ├─ product/
   ├─ public/
   └─ quote/
```

## Proteção de rotas

- Visitantes são redirecionados para `/entrar` ao abrir rotas de conta ou administração.
- O comportamento demonstrativo de autenticação foi preservado nesta etapa: e-mails contendo `admin` recebem o papel administrativo.
- A autenticação segura e persistente continua prevista para a etapa de backend.

## Compatibilidade de hospedagem

O servidor que publicar o frontend deve usar fallback de SPA, devolvendo `index.html` para URLs como `/produtos/mamaroo-40` e `/minha-conta`. O servidor de desenvolvimento do Vite já realiza esse fallback.

## Validações executadas

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- Testes de fumaça para home, catálogo, produto dinâmico e guard de conta.

## Limitações preservadas intencionalmente

Esta etapa não altera preços, orçamento, estoque, persistência, autenticação ou CRUDs. Essas regras permanecem demonstrativas até as próximas etapas do plano.
