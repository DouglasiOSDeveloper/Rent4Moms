# Etapa F - Motor comercial no frontend

## Objetivo

Exibir ao cliente a mesma composição calculada pelo backend e oferecer ao administrador controles explícitos para as regras de 60 e 90 dias.

## Administração

Em **Produtos > Novo/Editar produto**, cada período permite escolher:

- preço normal pela composição;
- desconto percentual no produto-base;
- preço-base fixo;
- gratuidade.

Quando a regra é gratuita, o administrador escolhe entre produto-base e configuração completa. A interface também informa que o frete não é zerado e que renovações não recebem benefícios.

## Site público

A página do produto:

- separa produto-base de pano/redutor;
- mostra desconto, preço especial ou gratuidade;
- solicita uma estimativa oficial ao backend;
- usa a mesma regra no orçamento e na revisão;
- envia ao pedido apenas IDs e parâmetros, nunca tabelas de preço confiáveis;
- exige a composição completa quando o produto possui modelo configurável.

## Segurança do payload

`createRemoteQuote` transforma o rascunho local em um payload enxuto contendo produto, quantidade, período, data e IDs da composição. `productSnapshot`, `priceSnapshot` e tarifas locais não são transmitidos como fonte de verdade.

## Validação

```powershell
npm run stage:f:verify
```
