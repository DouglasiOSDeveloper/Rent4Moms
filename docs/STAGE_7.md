# Etapa 7 — administração do estoque físico

## Alterações

- Nova rota administrativa `/admin/estoque`.
- Cadastro, edição e baixa lógica de unidades físicas.
- Filtros por tipo, status e busca livre.
- Indicadores de disponibilidade, bloqueios, lavagem e manutenção.
- Visualização das alocações de pedidos.
- Histórico de movimentações de cada unidade.
- Ação manual para liberar bloqueios vencidos.
- Detalhe de estoque no módulo de orçamentos.
- Ações do ciclo: aprovar/reservar, preparar, iniciar locação, registrar devolução e cancelar/liberar.
- Atualização do catálogo depois de qualquer movimentação que altere disponibilidade.
- Tela de sucesso informa o prazo do bloqueio e quantas peças foram alocadas.

## Fonte de verdade

O frontend não reduz contadores localmente. Depois do envio do orçamento e das ações administrativas, ele consulta novamente a API. O backend decide quais unidades foram alocadas e devolve erro de conflito quando o estoque acabou.

## Estados

- Disponível
- Bloqueada
- Reservada
- Em preparação
- Em locação
- Devolvida
- Em inspeção
- Em lavagem
- Em manutenção
- Indisponível
- Baixada

Unidades devolvidas permanecem em inspeção até a liberação administrativa. A baixa de uma unidade preserva seu histórico.

## Dependências

A página exige a API da Etapa 7 ativa e uma sessão administrativa válida. O catálogo público continua com fallback local em desenvolvimento, mas operações de estoque não possuem fallback, pois precisam de consistência transacional.
