# Etapa J — Migração, QA e publicação

A etapa final consolida os controles do frontend sem inserir catálogo, pessoas, avaliações, gráficos ou textos fictícios.

## Entregas

- gate “zero mock” sobre os arquivos de runtime;
- inspeção do artefato compilado para impedir URLs Unsplash, SVG provisório, `ShippingZone`, imports de mocks e variáveis Vite não resolvidas;
- execução conjunta de typecheck, lint, testes, build e validação de `dist`;
- preservação dos smoke tests da jornada Home → catálogo → produto → orçamento;
- preservação dos testes de acessibilidade, navegação protegida e recuperação de erros;
- CI executando a Etapa J e publicando somente o diretório `dist`;
- checklist manual para desktop, mobile, teclado, leitor de tela, API indisponível e rollback.

## Comando

```powershell
npm run stage:j:verify
```

O comando comprova a prontidão técnica do frontend. A publicação continua condicionada ao teste de restauração, ao banco de homologação e à validação do negócio registrados pelo gate do backend.
