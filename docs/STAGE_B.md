# Etapa B — Remoção coordenada de mocks

## Objetivo

Eliminar dados demonstrativos e fallbacks locais do runtime do frontend. Quando a API ou o banco não fornecerem registros, a interface deve apresentar estados explícitos de carregamento, vazio ou erro.

## Regras aplicadas

- `src/data/mocks` não existe mais no runtime.
- Fixtures permanecem apenas em `src/test/fixtures`.
- Falha da API não reativa catálogo, conteúdo, configurações ou números fictícios.
- Catálogo, Home, comparação e administração aceitam banco vazio.
- Imagens sem URL cadastrada mostram estado vazio; nenhum SVG ou imagem externa é gerado como fallback.
- Recuperação de senha permanece desabilitada até existir fluxo real no backend.
- O guard `guard:no-new-runtime-mocks` exige zero imports runtime de mocks.

## Validação

```bash
npm run guard:no-new-runtime-mocks
npm run check
```

A aprovação exige testes, lint, typecheck e build sem dados fictícios.
