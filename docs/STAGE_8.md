# Etapa 8 — criação de conta a partir do pedido

A interface agora preserva o código do orçamento durante o caminho de acompanhamento e cria uma conta usando os dados já fornecidos no pedido.

## Fluxo do cliente

1. A tela de sucesso envia visitantes para `/entrar?pedido=ORC-...`.
2. O login exibe qual solicitação será acompanhada.
3. Uma conta existente pode entrar normalmente; o backend vincula pedidos anônimos depois de validar a senha.
4. Ao escolher “Criar conta”, o código do pedido continua na URL.
5. O cliente informa somente o CPF usado na solicitação.
6. Um código de seis dígitos confirma a posse do e-mail cadastrado.
7. Nome, e-mail, CPF e telefone são recuperados do pedido.
8. Para uma conta nova, o cliente define somente senha e confirmação.
9. A sessão é iniciada e a página “Meus orçamentos” exibe os pedidos vinculados.

Se já existir uma conta para o CPF, a interface informa que a solicitação foi vinculada e direciona para o login, sem criar uma conta duplicada.

## Arquivos centrais

- `src/features/auth/pages/AuthPages.tsx`
- `src/services/auth/orderClaimApi.ts`
- `src/app/providers.tsx`
- `src/app/router.tsx`
- `src/features/quote/pages/QuotePages.tsx`

## Desenvolvimento local

Enquanto não existe um provedor real de e-mail/WhatsApp, o backend pode responder com `developmentCode`. A interface mostra esse código em um aviso identificado como ambiente de desenvolvimento.

Esse comportamento não deve existir em produção.

## Estados tratados

- pedido e CPF não encontrados;
- pedido já vinculado;
- intervalo de reenvio;
- código incorreto;
- limite de tentativas;
- código expirado;
- confirmação já usada;
- conflito entre e-mail e CPF de contas existentes;
- conta existente;
- criação e sessão da nova conta.
