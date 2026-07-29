# Etapa 7 — checklist manual de aceite pré-lançamento

Use uma janela anônima para os testes públicos e uma conta administrativa controlada para o painel. Registre capturas apenas quando não exibirem dados pessoais desnecessários.

## Site público

- [ ] Página inicial abre sem o card “Consultar disponibilidade”.
- [ ] Hero centralizado, com os dois botões previstos.
- [ ] Cards de produto exibem somente “Ver produto”.
- [ ] Catálogo abre diretamente pela URL `/produtos`.
- [ ] Um único filtro selecionado é removido por “Limpar filtros”, inclusive da URL.
- [ ] Imagens dos três modelos e das variantes carregam sem placeholder quebrado.
- [ ] Preço público aparece por 30 dias, não por semana.
- [ ] Página “Sobre nós” mostra a imagem institucional cadastrada pelo admin.
- [ ] Todos os links legais do rodapé abrem conteúdo publicado.

## Produto e orçamento

- [ ] Pano, redutor e período podem ser selecionados.
- [ ] Endereço completo pode ser preenchido na página do produto.
- [ ] Frete é recalculado após número/complemento sem divergência ao entrar no orçamento.
- [ ] Alterar 30, 60 e 90 dias atualiza imediatamente produto-base, acessórios, desconto, frete, total e devolução.
- [ ] O endereço previamente informado permanece preenchido.
- [ ] Orçamento é criado apenas uma vez mesmo se o e-mail falhar.
- [ ] Código de vínculo de conta chega ao destinatário controlado.
- [ ] Conta criada pelo pedido enxerga o orçamento/locação correto.

## Contrato e comunicação

- [ ] E-mail do orçamento chega ao endereço controlado.
- [ ] PDF do contrato abre, mantém dados do LOCADOR e todas as cláusulas.
- [ ] PDF de pagamento abre e apresenta pedido e valor corretos.
- [ ] Mensagem orienta o envio do contrato assinado e do comprovante por e-mail ou WhatsApp.
- [ ] Admin enxerga status, provedor e `messageId` da tentativa.
- [ ] Reenvio administrativo reutiliza os documentos sem duplicar o pedido.

## Painel administrativo

- [ ] Imagem institucional pode ser enviada, substituída e removida.
- [ ] E-mail aparece como operacional quando o Brevo está configurado.
- [ ] WhatsApp e SMS continuam como não configurados.
- [ ] Botão de olho em “Estoque físico > Alocações” abre o pedido correto.
- [ ] Pagamento, aprovação, preparação, entrega, devolução, evidências, higienização e manutenção atualizam status corretamente.
- [ ] Cores dos estados permanecem coerentes.
- [ ] Nenhuma imagem de produto ou evidência aparece quebrada.

## Base e estoque depois do saneamento

- [ ] Clientes e contas de teste foram removidos.
- [ ] Orçamentos, reservas e locações de teste foram removidos.
- [ ] Administradores continuam autenticando.
- [ ] Catálogo, preços, conteúdo e configurações permanecem intactos.
- [ ] Unidades físicas oficiais continuam presentes.
- [ ] As onze unidades baixadas aprovadas para retirada não aparecem mais.
- [ ] Indicadores do estoque conciliam com a lista de unidades.
- [ ] Nenhuma unidade válida ficou bloqueada, reservada ou em operação por causa dos testes apagados.

## Console, rede e responsividade

- [ ] Fluxo principal não apresenta erro impeditivo no console.
- [ ] Requisições críticas não retornam CORS error, `Failed to fetch` ou `5xx`.
- [ ] Desktop, tablet e celular mantêm navegação utilizável.
- [ ] Rotas diretas continuam funcionando após atualização do navegador.

## Encerramento

- [ ] Frontend CI aprovado.
- [ ] Backend CI aprovado.
- [ ] Backend no Lightsail está `healthy`.
- [ ] Health e readiness retornam `200`.
- [ ] Smoke automatizado de produção aprovou todas as verificações.
- [ ] Backup e relatórios de saneamento foram arquivados.
- [ ] Pedido controlado usado no teste final foi removido pela rotina aprovada ou cancelado e reconciliado antes da divulgação.
