# Etapa 12 — QA, acessibilidade e publicação

A etapa final prepara o frontend para operação pública sem alterar as regras de negócio implantadas nas etapas anteriores.

## Entregas

- Título e metadados reais da Rent4Moms.
- Idioma da página definido como `pt-BR`.
- Link para pular diretamente ao conteúdo.
- Foco movido para o conteúdo principal a cada mudança de rota.
- Títulos de página atualizados conforme a navegação.
- Controles de navegação com nomes acessíveis e estados expandidos.
- Error boundary com recuperação visível.
- Captura de erros de renderização, janela e promises rejeitadas.
- Relato sanitizado de erros para o backend.
- Headers de segurança e fallback SPA para plataformas compatíveis.
- `robots.txt` que impede indexação das áreas privadas.
- Manifesto básico da aplicação.
- Verificador do artefato de produção e limite de JavaScript.
- Testes estruturais de acessibilidade e recuperação de erros.
- Documentação de publicação e validação manual.

## Scripts

- `npm run check`: typecheck, lint, testes e build.
- `npm run verify:dist`: valida metadados, indexação, source maps e tamanho do JavaScript.
- `npm run qa:production`: executa o ciclo completo de qualidade e valida o artefato.

## Limitações conhecidas

- A validação automatizada de acessibilidade cobre a estrutura principal; uma auditoria manual com leitor de tela ainda é obrigatória.
- O arquivo `_headers` é aplicado apenas por hospedagens que reconhecem esse formato. Em outras plataformas, os mesmos headers devem ser configurados no proxy/CDN.
- O bundle principal continua acima de 500 kB. O limite operacional desta etapa é 2,5 MB, mas code splitting permanece uma melhoria recomendada.
