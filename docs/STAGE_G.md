# Etapa G - Frete autoritativo no frontend

## Objetivo

Remover o cálculo local por prefixos de CEP e tratar o backend como única fonte do valor de entrega.

## Site público

- A página do produto solicita uma prévia pelo CEP.
- O fluxo de orçamento recalcula ao preencher o endereço.
- Distância e valor são apresentados quando a estimativa é válida.
- Falhas de rota ou configuração não geram valores fictícios.
- Retirada e atendimento combinado permanecem sem frete.

## Segurança do pedido

`createRemoteQuote` não envia `shippingQuote` como valor confiável. No envio final, o backend consulta novamente a rota com o endereço completo, aplica os parâmetros vigentes e grava o snapshot oficial.

## Administração

Em **Configurações**, o administrador controla origem, combustível, consumo, multiplicador, taxa mínima, ida e volta, limite de distância e ativação da entrega. A chave do provedor de rotas permanece exclusivamente no backend.

## Validação

```powershell
npm run stage:g:verify
```
