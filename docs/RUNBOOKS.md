# Runbooks operacionais

## Publicar produto configurável

1. Cadastre o produto e as regras oficiais de período.
2. Cadastre/vincule modelo e componentes reais.
3. Configure compatibilidades sem forçar vínculos inexistentes.
4. Cadastre angulações usadas e envie fotos da variante.
5. Crie unidades físicas no Estoque.
6. Revise campos, publicação e mídia.
7. Publique somente quando a composição estiver válida.

**Resultado esperado:** o item aparece no site com disponibilidade derivada exclusivamente das unidades `available`.

## Processar pedido até a devolução

1. Abra o pedido e confira seleção, datas, endereço, preço e frete.
2. Registre pagamento ou observação.
3. Confirme a reserva.
4. Inicie a preparação.
5. Registre a entrega e evidências.
6. Na devolução, envie fotos e registre a ação.
7. Encaminhe cada unidade à higienização ou manutenção.

**Resultado esperado:** a timeline contém o ciclo completo e as unidades terminam em estado operacional coerente.

## Higienizar unidade

1. Confirme que não existe alocação ativa.
2. Crie o job e informe responsável.
3. Avance por lavagem, secagem e inspeção.
4. Registre checklist e evidências quando aplicável.
5. Aprove apenas quando a unidade estiver pronta.
6. Rejeite quando precisar de manutenção.

**Resultado esperado:** `approved` retorna a `available`; `rejected` envia a `maintenance`.

## Tratar manutenção

1. Abra o job com tipo, problema e responsável.
2. Registre diagnóstico e custo quando houver.
3. Avance por reparo e teste.
4. Use `completed` somente após validação segura.
5. Use `unrepairable` quando não puder voltar ao uso.

**Resultado esperado:** `completed` retorna a `available`; `unrepairable` passa a `unavailable`.

## API indisponível

1. Não preencha a tela com dados locais.
2. Verifique saúde da API e PostgreSQL.
3. Confirme ambiente, CORS e sessão.
4. Consulte logs pelo `requestId`.
5. Restaure o serviço e use **Tentar novamente**.

**Resultado esperado:** a tela volta a consumir a fonte oficial sem ressuscitar conteúdo local.

## Divergência de frete

1. Confira origem e parâmetros em Configurações.
2. Revise o endereço completo do destino.
3. Refaça a estimativa pelo fluxo normal.
4. Compare distância, combustível, multiplicador, taxa mínima e ida/volta no snapshot.
5. Corrija configuração/endereço e recalcule; não sobrescreva o valor no navegador.

**Resultado esperado:** o pedido persiste o valor recalculado pelo servidor e seu snapshot auditável.
