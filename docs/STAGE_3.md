# Etapa 3 — Catálogo normalizado e categorias dinâmicas

## Objetivo

Substituir o vínculo fixo de uma categoria por produto por uma estrutura muitos-para-muitos, mantendo uma única fonte de dados compartilhada entre Home, catálogo, produto e painel administrativo.

## Implementado

- Domínio próprio de catálogo em `src/domain/catalog`.
- `Product.categoryIds` permite vincular um produto a uma ou mais categorias.
- Categorias possuem nome, descrição, ícone, estilo visual, status de publicação e ordem.
- Contagens de produtos são calculadas a partir dos vínculos; não ficam mais gravadas manualmente.
- Repositório local abstraído em `src/services/catalog`.
- Persistência temporária do catálogo em `localStorage` com chave versionada.
- `CatalogProvider` centraliza produtos, categorias e ações administrativas.
- Home, catálogo, página do produto, comparador e administração consomem o mesmo estado.
- Clique em uma categoria da Home abre o catálogo já filtrado pela URL.
- Busca do catálogo considera nome do produto, marca e categorias.
- Categorias inativas deixam de aparecer na Home e nos filtros públicos.
- Nova rota administrativa: `/admin/categorias`.
- CRUD local de categorias: criar, editar, publicar/despublicar, ordenar e excluir.
- Exclusão de categoria também remove seus vínculos com produtos.
- Tela de produtos permite editar vários vínculos de categoria por produto.
- Dados demonstrativos podem ser restaurados pelo administrador.

## Persistência atual

As alterações são persistidas apenas no navegador durante esta fase. A interface usa um contrato de repositório para que a fonte local seja substituída pela API sem reescrever as telas quando o backend de catálogo for implantado.

## Regras preservadas

- Preços e estado do orçamento continuam usando a fundação da Etapa 2.
- O catálogo demonstrativo continua com os oito produtos existentes.
- Cadastro completo de modelos, panos, redutores, bolinhas e variantes visuais permanece reservado para a Etapa 4.
- Autenticação e proteção administrativa ainda são demonstrativas até a etapa de backend.

## Validação

Executado com sucesso:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Cobertura adicionada:

- relação muitos-para-muitos;
- remoção de vínculos ao excluir categoria;
- ocultação pública de categoria inativa;
- contagem derivada de produtos;
- persistência e rejeição de snapshot local inválido.

## Próxima etapa

A Etapa 4 deverá cadastrar o domínio de modelos de cadeira, panos, redutores, bolinhas, compatibilidades, variantes e quatro angulações, usando o catálogo normalizado criado aqui.
