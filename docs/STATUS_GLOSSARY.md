# Glossário operacional de status

## Pedidos

| Status | Efeito | Próximo passo |
|---|---|---|
| Em análise | Pedido criado com cálculo oficial e bloqueio temporário. | Reservar ou cancelar. |
| Aprovado | Reserva confirmada. | Preparar, entregar ou cancelar. |
| Em preparação | Unidades em separação. | Entregar ou cancelar. |
| Em locação | Entrega registrada e unidades alugadas. | Devolver ou tratar renovação elegível. |
| Devolvido | Alocações encerradas. | Higienizar ou encaminhar à manutenção. |
| Cancelado | Ciclo interrompido e alocações liberadas. | Consultar timeline; não avançar. |
| Expirado | Bloqueio venceu antes do processamento. | Criar nova solicitação quando necessário. |

## Unidades físicas

| Código | Rótulo | Efeito |
|---|---|---|
| `available` | Disponível | Conta na disponibilidade pública. |
| `held` | Bloqueada | Separada temporariamente por orçamento. |
| `reserved` | Reservada | Vinculada a pedido aprovado. |
| `preparing` | Em preparação | Em separação para entrega. |
| `rented` | Em locação | Está com o cliente. |
| `returned` | Devolvida | Estado intermediário disponível para ajuste operacional; a ação padrão de devolução segue diretamente para `inspection`. |
| `inspection` | Em inspeção | Aguarda decisão após higienização. |
| `washing` | Em lavagem | Em processo de higienização. |
| `maintenance` | Em manutenção | Bloqueada para diagnóstico/reparo. |
| `unavailable` | Indisponível | Não pode ser alocada. |
| `retired` | Baixada | Retirada definitivamente do uso. |

## Higienização

| Código | Efeito sobre a unidade |
|---|---|
| `waiting`, `in_progress`, `drying` | Mantém `washing`. |
| `inspection` | Muda para `inspection`. |
| `approved` | Muda para `available`. |
| `rejected` | Muda para `maintenance`. |

## Manutenção

| Código | Efeito sobre a unidade |
|---|---|
| `open`, `diagnosing`, `waiting_parts`, `repairing`, `testing` | Mantém `maintenance`. |
| `completed` | Muda para `available`. |
| `unrepairable` | Muda para `unavailable`. |

## Pagamento

- `pending`: pendente.
- `partial`: recebimento parcial.
- `received`: recebimento registrado.
- `refunded`: valor estornado/devolvido.

## Experiência do cliente

- Renovação: `pending`, `approved`, `rejected`, `cancelled`.
- Avaliação: `published`, `hidden`, `rejected`.
- Suporte: `open`, `in_progress`, `closed`.

Renovações não recebem promoção ou gratuidade. Somente avaliações `published` participam da média pública.
