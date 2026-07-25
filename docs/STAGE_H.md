# Etapa H — módulos administrativos reais no frontend

O dashboard, clientes, reservas, calendário, relatórios, usuários e notificações agora consomem endpoints administrativos próprios.

## Comportamento

- Indicadores do dashboard chegam consolidados pelo backend.
- Clientes incluem contas reais e compradores anônimos encontrados nos pedidos.
- Reservas usam a fila filtrada no servidor.
- O calendário exibe somente datas persistidas nos itens dos pedidos.
- Relatórios possuem filtros e exportação CSV oficial.
- Usuários exibem somente contas persistidas e seus papéis reais.
- O sino mostra apenas pendências retornadas pela API; sem ponto vermelho fixo.

Cada módulo diferencia carregamento, vazio e falha. Nenhuma tela cria gráficos, pessoas, receitas ou notificações para preencher espaço.

## Verificação

```powershell
npm run stage:h:verify
```
