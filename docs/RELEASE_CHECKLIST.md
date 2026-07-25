# Checklist de homologação e publicação do frontend

## Automático

Execute `npm run stage:j:verify` e registre o commit e o resultado. O comando precisa concluir sem warnings de lint, testes falhos, source maps, mocks de runtime ou marcadores demonstrativos no bundle.

## Jornada pública

- abrir Home, catálogo e URL direta de produto;
- selecionar configuração e período;
- calcular frete por endereço;
- avançar ao orçamento e confirmar que o total permanece igual ao servidor;
- testar retirada com frete zero;
- confirmar estados loading, empty, error e retry sem dados locais.

## Conta e administração

- entrar como cliente e abrir pedido/timeline;
- entrar como administrador e abrir dashboard, catálogo, estoque, pedidos, calendário, relatórios, usuários, notificações e ajuda;
- confirmar que páginas vazias exibem ação apropriada, não números inventados;
- conferir upload e visibilidade de mídia.

## Acessibilidade e responsividade

- teclado completo e foco visível;
- zoom 200%;
- leitor de tela nas rotas críticas;
- larguras 320, 360, 768, 1280 e 1600 px;
- labels, mensagens de erro, modais e menus móveis;
- status compreensíveis sem depender apenas de cor.

## Publicação

- configurar `VITE_API_BASE_URL` para a API de homologação/produção;
- garantir correspondência com `CORS_ORIGIN` do backend;
- publicar somente `dist` por HTTPS;
- aplicar `_headers`, fallback SPA e política de cache;
- executar smoke test após a publicação;
- manter o artefato anterior disponível para rollback.

A aprovação final deve ser registrada no arquivo de evidências da Etapa J do backend. Não use o checklist como aprovação automática do negócio.
