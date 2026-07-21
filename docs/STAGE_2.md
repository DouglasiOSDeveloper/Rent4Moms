# Etapa 2 — domínio, preço e estado único do orçamento

## Objetivo

Eliminar as divergências entre página do produto, carrinho e revisão, além de impedir que período, data, quantidade, CEP e forma de recebimento sejam perdidos durante a navegação ou após atualizar a página.

## Implementado

- `QuoteDraft` único para todas as etapas do orçamento.
- `QuoteProvider` com reducer e persistência no `localStorage`.
- Snapshot do produto e do preço dentro de cada item do orçamento.
- Inclusão e atualização do mesmo produto sem criar itens duplicados.
- Transporte da seleção feita na página do produto:
  - período;
  - data inicial e final;
  - quantidade;
  - CEP;
  - entrega, retirada ou combinação;
  - frete estimado.
- Motor central de preços para diária, semana e mês.
- Resumo central do orçamento com frete aplicado uma única vez.
- Renovação já prevista no motor com bloqueio de desconto no modo `renewal`.
- Cálculo de frete por CEP isolado do arquivo de mocks.
- Utilitários únicos para dinheiro e datas.
- Formulários das etapas ligados ao mesmo rascunho persistente.
- Correção do campo duplicado de logradouro; o segundo campo agora é complemento.

## Regra de preço temporária

Enquanto o backend e as regras administrativas ainda não existem, o frontend decompõe o período em blocos de:

1. 30 dias pelo valor mensal;
2. 7 dias pelo valor semanal;
3. dias restantes pelo valor diário.

Exemplo do MamaRoo 4.0:

- 30 dias: R$ 399,00;
- 60 dias: R$ 798,00;
- 90 dias: R$ 1.197,00.

A regra está concentrada em `src/domain/pricing/pricingEngine.ts` e deverá ser substituída ou alimentada pelas tarifas administrativas quando o backend for integrado.

## Persistência temporária

O rascunho é salvo na chave:

`rent4moms.quote-draft.v1`

Essa persistência existe apenas para não perder o orçamento antes da API. O backend continuará sendo responsável por recalcular preço, frete e disponibilidade antes de criar um pedido real.

## Arquivos centrais

- `src/domain/quote/types.ts`
- `src/domain/quote/factories.ts`
- `src/domain/pricing/pricingEngine.ts`
- `src/domain/shipping/shippingCalculator.ts`
- `src/stores/quote/QuoteProvider.tsx`
- `src/stores/quote/quoteReducer.ts`
- `src/stores/quote/persistence.ts`
- `src/features/product/pages/ProductPage.tsx`
- `src/features/quote/pages/QuotePages.tsx`

## Testes adicionados

- preço para 30, 60 e 90 dias;
- composição de blocos mensal, semanal e diário;
- renovação sem desconto;
- frete aplicado uma única vez;
- transporte integral da seleção do produto;
- reprecificação ao alterar período;
- persistência e restauração do rascunho;
- fluxo visual produto → orçamento com período, datas, CEP e total idênticos.

## Resultado das verificações

- Typecheck: aprovado.
- ESLint: aprovado.
- Testes: 12 aprovados.
- Build Vite: aprovado.
- Aviso conhecido: bundle principal acima de 500 kB, sem bloquear o build.

## Fora do escopo desta etapa

- cadastro de panos, redutores e bolinhas;
- compatibilidade das 48 variantes;
- máscaras e validação completa dos formulários;
- consulta real de CEP;
- cálculo de distância por mapas;
- banco de dados e autenticação real;
- reserva transacional de estoque.

Esses pontos permanecem nas etapas seguintes do plano.
