# Origem de dados — frontend após a Etapa B

## Runtime

O frontend não possui catálogo, clientes, pedidos, indicadores, conteúdo institucional, FAQ, depoimentos, zonas de frete ou imagens demonstrativas no runtime.

As fontes aceitas são:

- API do backend;
- estado transitório do orçamento do usuário;
- parâmetros técnicos sem conteúdo comercial;
- estados explícitos de carregamento, vazio, erro e indisponibilidade.

## Testes

Fixtures permanecem exclusivamente em `src/test/fixtures` e em arquivos `*.test.*`. Elas não podem ser importadas por páginas, providers, serviços ou componentes executados em produção.

## Garantia automatizada

```bash
npm run guard:no-new-runtime-mocks
```

O comando falha quando:

- `src/data/mocks` volta a existir;
- algum arquivo runtime passa a importar conteúdo dessa origem.

## Dados ausentes

- API indisponível: mostrar erro e opção de nova tentativa.
- API disponível sem registros: mostrar estado vazio.
- imagem não cadastrada: mostrar estado vazio, sem gerar SVG ou buscar imagem externa.
- conteúdo institucional não publicado: omitir o canal ou mostrar aviso de não configuração.
