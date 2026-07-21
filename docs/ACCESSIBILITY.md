# Checklist de acessibilidade

## Automatizado

- um único conteúdo principal por shell;
- link “Pular para o conteúdo principal”;
- foco no conteúdo após navegação;
- nomes acessíveis nos botões com apenas ícone;
- menus com `aria-label`, `aria-expanded` e `aria-controls`;
- título de documento por rota;
- fallback acessível para erros de renderização.

## Manual antes da publicação

- navegar por todas as telas críticas usando apenas teclado;
- confirmar ordem de foco visível;
- testar zoom a 200% sem perda de conteúdo;
- verificar contraste de texto, botões, badges e erros;
- testar Home, Produto, Orçamento, Login e Conta com leitor de tela;
- confirmar labels e mensagens em todos os campos obrigatórios;
- validar modais, drawers e menus móveis;
- testar larguras de 320, 360, 768, 1280 e 1600 pixels;
- confirmar que status não dependem somente de cor.

Registre os problemas encontrados com rota, largura, navegador e tecnologia assistiva utilizada.
