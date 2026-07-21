# Etapa 4 — Configurador de cadeiras e variantes visuais

## Objetivo

Implantar o domínio inicial de montagem das cadeiras 4moms, mantendo o frontend independente do backend até a etapa de persistência em API.

## Entregas

- Modelos 2.0, 3.0 e 4.0 ativos; estrutura 5.0 inativa e sem estoque.
- Panos tipo 1 a 11.
- Redutores tipo 1 a 4.
- Conjuntos de bolinhas exclusivos por modelo.
- Compatibilidades e preferências separadas.
- 48 variantes visuais derivadas do PDF de controle:
  - 28 variantes da 4.0;
  - 12 variantes da 3.0;
  - 8 variantes da 2.0.
- Quatro angulações por variante: FRT, DIR, ESQ e SUP.
- Total de 192 registros de imagem.
- Configurador público com seleção de pano e redutor.
- Bolinhas selecionadas automaticamente pelo modelo.
- Descrição acumulada da cadeira, do pano e do redutor.
- Preço calculado a partir da soma das tarifas do modelo e dos componentes.
- Disponibilidade provisória calculada pelo componente mais restritivo.
- Snapshot da montagem gravado no rascunho do orçamento.
- Área administrativa em `/admin/montagem-4moms`.

## Imagens provisórias

Os 192 registros possuem placeholders SVG técnicos gerados no navegador. Cada registro preserva:

- ID da variante;
- prefixo técnico;
- angulação;
- nome de arquivo esperado.

Quando o armazenamento privado do backend estiver disponível, o campo `assetKey` poderá receber a URL autorizada de cada imagem. Variantes incompletas são mantidas como rascunho e não aparecem no configurador público.

## Persistência temporária

O catálogo local foi atualizado para a versão 2. Catálogos da Etapa 3 são migrados automaticamente, preservando categorias e produtos editados e adicionando a estrutura do configurador.

## Limites desta etapa

- A quantidade ainda é um contador demonstrativo; estoque por unidade física entra na Etapa 7.
- Upload real de imagens depende do backend e do storage.
- Preços dos componentes são dados demonstrativos e serão substituídos pelo CRUD comercial definitivo.
- A API ainda não revalida compatibilidade, preço ou disponibilidade.

## Validações

- 48 variantes e 192 imagens.
- Todas as variantes iniciais com FRT, DIR, ESQ e SUP.
- Compatibilidade correta por modelo.
- Variante `4.0-026` resolvida como `m40_p07_r01_b40`.
- Bolinhas nunca misturadas entre modelos.
- Descrição e preço acumulados.
- Configuração preservada no orçamento.
