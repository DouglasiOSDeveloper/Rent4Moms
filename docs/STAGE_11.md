# Etapa 11 — conteúdo, rodapé, legal e integrações

A interface passou a consumir do backend um documento institucional único com nome da marca, apresentação, contatos, redes sociais, horários, rodapé e mensagem padrão de WhatsApp.

## Área pública

- Header, Home, Sobre, Contato, rodapé e botão flutuante usam os dados administrativos.
- O rodapé lista somente páginas legais publicadas.
- Foram adicionadas as rotas públicas de privacidade, termos, cancelamento, entrega, contrato e cookies, além da rota extensível `/legal/:slug`.
- A página legal apresenta a versão e a data efetivamente publicadas.

## Administração

A rota `/admin/conteudo` possui as áreas:

- Institucional: marca, contatos, redes, horários, rodapé e WhatsApp.
- Páginas legais: criação, edição de rascunho, publicação versionada e arquivamento.
- Integrações: preparação de pagamentos, e-mail, WhatsApp e SMS sem armazenamento de segredos no frontend.

Salvar um rascunho legal não altera a página pública. A publicação é uma ação separada e cria uma nova versão.
