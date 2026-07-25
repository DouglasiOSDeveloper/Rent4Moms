# Etapa I — documentação operacional e ajuda

A Etapa I adiciona uma **Central de ajuda operacional** ao painel administrativo e versiona os procedimentos essenciais dentro do repositório.

## Entregas

- rota protegida `/admin/ajuda`;
- item **Ajuda operacional** no menu administrativo;
- botão **Ajuda desta tela**, com orientação ligada ao módulo atual;
- mapa dos módulos e de suas fontes oficiais;
- mapa de onde cadastrar cada foto;
- ciclo completo do pedido e efeitos sobre o estoque;
- glossário de status;
- papéis e limites de acesso atualmente implementados;
- runbooks para publicação, pedido, higienização, manutenção, indisponibilidade da API e divergência de frete.

A ajuda descreve regras técnicas e operacionais; ela não cria dados nem altera registros.

## Documentos

- `docs/OPERATIONS_GUIDE.md`
- `docs/STATUS_GLOSSARY.md`
- `docs/RUNBOOKS.md`

## Verificação

```powershell
npm run stage:i:verify
```

O comando executa typecheck, lint, testes, build e a verificação de presença dos conteúdos obrigatórios da Etapa I.
