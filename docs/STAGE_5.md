# Etapa 5 — Formulários, CEP, datas e horários

## Objetivo

Implementar validação real por etapa, máscaras brasileiras, preenchimento automático do endereço por CEP, data mínima a partir de amanhã e janelas de entrega de 30 minutos configuráveis no administrador.

## Entregas

- Máscaras para CEP, CPF, telefone, WhatsApp e UF.
- Validação de CPF, e-mail, telefone, CEP e campos obrigatórios.
- Bloqueio da navegação do orçamento quando a etapa contém dados inválidos.
- Mensagens de erro no campo e resumo acessível da etapa.
- Consulta automática do endereço após o preenchimento de um CEP completo.
- Preenchimento de rua, bairro, cidade e estado, mantendo número e complemento editáveis.
- Data inicial mínima calculada como amanhã no fuso `America/Sao_Paulo`.
- Revalidação da data no fluxo do produto e no orçamento.
- Janelas de entrega geradas de 30 em 30 minutos.
- Horário inicial e final editáveis em **Administração → Configurações → Geral**.
- Persistência temporária da configuração de horários no `localStorage`.
- Horário selecionado armazenado no `QuoteDraft` e exibido na revisão.

## Limites desta etapa

- A consulta de CEP é feita diretamente pelo frontend de forma temporária. Na Etapa 6, a API privada deverá assumir o proxy e a validação no servidor.
- As zonas e valores de frete permanecem demonstrativos e locais.
- Capacidade logística, feriados e bloqueios de agenda ainda não são aplicados.

## Critérios de aceite verificados

- O dia atual não pode ser selecionado nem aceito pela validação.
- O usuário não avança com campos obrigatórios inválidos.
- CEP completo dispara a busca de endereço e permite correção manual.
- A configuração `10:00–18:00` gera intervalos como `11:00–11:30`.
- Alterar o horário no administrador atualiza as opções públicas.
- Máscaras não alteram os valores normalizados usados pelos validadores.
