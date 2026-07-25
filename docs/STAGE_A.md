# Etapa A — Congelamento e inventário de dados

## Objetivo

Congelar a origem dos dados antes da remoção dos mocks. Esta etapa não exclui fixtures, não altera o catálogo e não limpa o banco. Ela cria rastreabilidade suficiente para a Etapa B remover dados demonstrativos sem apagar dados reais por engano.

## Branch de implementação

Antes de aplicar o patch:

```bash
git switch -c etapa-a-congelamento-inventario
```

Se a branch já existir:

```bash
git switch etapa-a-congelamento-inventario
```

## Controles adicionados

- `npm run guard:no-new-runtime-mocks`: impede novos imports runtime de `src/data/mocks`.
- `npm run stage:a:inventory`: gera manifesto de versão, hashes das fontes demonstrativas e lista dos consumidores runtime atuais.
- `npm run check`: agora executa o guard antes de typecheck, lint, testes e build.

Os imports já existentes estão congelados em `config/runtime-mock-imports-baseline.json`. Eles podem ser removidos durante a Etapa B, mas novos itens não podem ser adicionados à baseline para contornar o guard sem revisão explícita.

## Gerar o inventário

```bash
npm run stage:a:inventory
```

Os arquivos são gravados em `reports/stage-a/frontend-<timestamp>/` e não são versionados porque podem conter informações do ambiente local, como branch e commit.

## Critérios de aceite do frontend

- branch de implementação criada;
- inventário gerado e arquivado junto ao backup do backend;
- `npm run guard:no-new-runtime-mocks` aprovado;
- `npm run check` aprovado;
- nenhum mock removido ou novo consumidor adicionado nesta etapa.

## Próxima etapa

A Etapa B removerá os consumidores listados no relatório, implantará estados `loading`, `empty`, `error`, `forbidden` e `offline`, e deixará fixtures somente dentro dos testes.
