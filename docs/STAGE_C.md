# Etapa C — Administração real do catálogo

## Entrega

O painel deixou de editar um snapshot completo e passou a usar operações específicas da API para:

- categorias;
- produtos;
- modelos de cadeira;
- panos;
- redutores;
- conjuntos de bolinhas;
- compatibilidades;
- variantes visuais.

A tela Produtos possui cadastro, edição, ativação, publicação e exclusão com análise de impacto. O módulo Montagem 4moms permite criar e remover modelos e componentes, inclusive salvar um pano ou redutor sem nenhuma compatibilidade selecionada.

## Fluxo de exclusão

1. O painel consulta o impacto no backend.
2. Sem dependências, arquiva diretamente.
3. Com dependências, mostra os vínculos encontrados.
4. Mediante confirmação, solicita a resolução `deactivate_dependents`.
5. O catálogo administrativo é atualizado com a resposta oficial da API.

Não existe persistência local nem salvamento automático do catálogo inteiro.

## Publicação

O site público recebe somente registros ativos e publicados. O painel recebe rascunhos e inativos para administração.

## Limites desta etapa

As fotos continuam representadas pelos campos existentes. Upload e CRUD de angulações serão feitos na Etapa E. A angulação `SUP` ainda permanece no tipo legado apenas para não misturar a migração de mídia com o CRUD normalizado.

## Verificação

```powershell
npm run stage:c:verify
```
