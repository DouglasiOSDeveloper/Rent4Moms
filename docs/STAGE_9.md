# Etapa 9 — operação administrativa

O painel administrativo agora utiliza dados reais da API para controlar o ciclo do pedido.

## Rotas

- `/admin/orcamentos` — pedidos persistidos;
- `/admin/orcamentos/:quoteId` — detalhe operacional;
- `/admin/reservas` — pedidos aprovados, em preparação, locação ou devolvidos;
- `/admin/entregas` — agenda derivada dos pedidos;
- `/admin/higienizacao` — trabalhos por unidade física;
- `/admin/manutencao` — manutenções por unidade física.

## Detalhe do pedido

A tela consolida:

- cliente, contatos e CPF;
- endereço, modalidade e janela;
- produtos e composição 4moms;
- unidades físicas alocadas;
- valor e pagamento manual;
- ações de reserva, preparação, entrega, devolução e cancelamento;
- fotos e evidências;
- observações internas e timeline;
- encaminhamento de unidades para higienização ou manutenção.

## Fotos

A interface aceita múltiplas fotos JPG, PNG ou WebP. Cada arquivo pode ser associado:

- ao pedido inteiro;
- a uma unidade física;
- a entrega, devolução, avaria, higienização ou manutenção.

O envio usa `FormData`. O cliente de API não define `Content-Type: application/json` quando o corpo é multipart, permitindo que o navegador gere o boundary correto.

## Higienização

O administrador seleciona unidades e acompanha os estados:

- aguardando;
- em andamento;
- secagem;
- inspeção;
- aprovada;
- reprovada.

A aprovação devolve a unidade ao estoque disponível. A reprovação envia a unidade para manutenção.

## Manutenção

A manutenção pode ser preventiva ou corretiva e usa os estados:

- aberta;
- diagnóstico;
- aguardando peças;
- reparo;
- teste;
- concluída;
- sem reparo.

Conclusão libera a unidade; “sem reparo” deixa a unidade indisponível.

## Pagamento

O registro manual contempla status, forma, valor, data e observação. Toda alteração gera evento na timeline do pedido.
