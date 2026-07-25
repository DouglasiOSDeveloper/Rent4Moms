# Publicação do frontend

## Variáveis

Defina o backend público:

```env
VITE_API_BASE_URL=https://api.seudominio.com/api/v1
```

A origem precisa coincidir exatamente com `CORS_ORIGIN` no backend.

## Build

```bash
npm ci
npm run qa:production
```

Publique somente o conteúdo de `dist/`.

## Requisitos da hospedagem

- HTTPS obrigatório.
- Todas as rotas desconhecidas devem retornar `index.html` para o React Router.
- Aplicar os headers definidos em `public/_headers` ou equivalentes.
- Não armazenar em cache `index.html` por períodos longos.
- Assets com hash podem receber cache longo e imutável.
- Não expor source maps em produção.

## Smoke test após publicação

1. Abrir a Home e o catálogo.
2. Abrir diretamente uma URL de produto e atualizar a página.
3. Configurar um produto e avançar até o orçamento.
4. Entrar como cliente e consultar um pedido.
5. Entrar como administrador e abrir estoque e operação.
6. Verificar uma página legal publicada.
7. Confirmar que `/admin` e `/minha-conta` não aparecem no `robots.txt`.
8. Simular uma API indisponível e confirmar os estados de erro.

## Rollback

Mantenha o artefato anterior disponível. Em caso de regressão:

1. restaurar o diretório `dist` anterior;
2. limpar apenas o cache do HTML;
3. manter os assets anteriores durante a propagação;
4. executar novamente o smoke test.

## Gate final da Etapa J

Antes de gerar o artefato que seguirá para homologação ou produção, execute:

```bash
npm run stage:j:verify
```

Além do QA anterior, o gate inspeciona os arquivos de runtime e o bundle compilado contra mocks, URLs demonstrativas, placeholders de mídia, frete legado e variáveis Vite não resolvidas. A aprovação final é registrada junto ao backend depois do teste de restauração e da validação do negócio.
