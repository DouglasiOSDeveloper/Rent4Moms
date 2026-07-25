# Guia operacional da administração

## Mapa de módulos

| Módulo | Responsabilidade | Fonte oficial | Efeito principal |
|---|---|---|---|
| Dashboard | KPIs e pendências reais | `/api/v1/admin/dashboard` | Somente leitura; abre filas filtradas. |
| Produtos | Produto comercial, preço, publicação e fotos | Catálogo e regras de preço | Publicação válida altera o catálogo futuro; pedidos antigos preservam snapshots. |
| Montagem 4moms | Modelos, panos, redutores, bolinhas, compatibilidades, variantes e angulações | Catálogo normalizado e `media_assets` | Pode afetar composições futuras; nunca reescreve pedido antigo. |
| Categorias | Organização e filtros | Categorias persistidas | Categorias ativas refletem na navegação pública quando aplicáveis. |
| Orçamentos | Análise, pagamento, ciclo, evidências e timeline | Pedido, estoque e operações | Ações transacionais alteram pedido e unidades. |
| Reservas e locações | Fila dos pedidos aprovados ou operacionais | `/api/v1/admin/reservations` | Ações são feitas no detalhe do pedido. |
| Estoque físico | Unidades, condição, localização e movimentações | `inventory_units` | Apenas `available` compõe disponibilidade pública. |
| Clientes | Contas e compradores encontrados em pedidos | Usuários e pedidos | Somente leitura consolidada. |
| Calendário | Inícios e devoluções persistidos | `/api/v1/admin/calendar` | Não grava uma agenda paralela. |
| Entregas | Preparação, entrega e devolução | Pedidos e eventos | Entrega inicia locação; devolução encerra alocações. |
| Higienização | Lavagem, secagem, inspeção e aprovação | `hygiene_jobs` | Aprovada retorna a unidade; rejeitada envia à manutenção. |
| Manutenção | Diagnóstico, reparo, teste e resultado | `maintenance_jobs` | Concluída retorna a unidade; sem reparo torna indisponível. |
| Experiência do cliente | Renovações, avaliações e suporte | Registros persistidos | Renovação não recebe gratuidade; avaliação publicada atualiza média. |
| Relatórios | Consulta e CSV | `/api/v1/admin/reports` | Usa somente dados persistidos. |
| Usuários | Contas e papéis atuais | `/api/v1/admin/users` | Somente leitura nesta versão. |
| Conteúdo do site | Contatos, horários e páginas legais | CMS persistido | Apenas conteúdo pronto/publicado aparece no site. |
| Configurações | Entrega e frete por rota | `delivery_settings` e `shipping_settings` | Afeta estimativas futuras; pedidos antigos preservam snapshot. |
| Ajuda operacional | Este guia, status e procedimentos | Documentação versionada | Não altera dados. |

## Onde cadastrar cada foto

| Foto | Caminho no painel | Uso |
|---|---|---|
| Produto | **Produtos > abrir/cadastrar produto > Fotos** | Capa, card e galeria. |
| Modelo | **Montagem 4moms > Modelos > abrir modelo > Fotos** | Referência visual do modelo. |
| Pano | **Montagem 4moms > Panos > abrir pano > Fotos** | Miniatura e detalhe. |
| Redutor | **Montagem 4moms > Redutores > abrir redutor > Fotos** | Miniatura e detalhe. |
| Bolinhas | **Montagem 4moms > Bolinhas > abrir conjunto > Fotos** | Referência do conjunto. |
| Variante | **Montagem 4moms > Variantes > abrir variante > Fotos** | Galeria da composição por angulação. |
| Evidência operacional | **Orçamentos > abrir pedido > Evidências** | Entrega, devolução, avaria, higiene, manutenção e documento. |

Regras de mídia:

1. Use JPG, PNG ou WebP.
2. Informe texto alternativo útil.
3. Marque **Visível no site** somente para mídia pública.
4. Para variante, selecione uma angulação ativa; ao menos uma foto pública válida é exigida para publicação.
5. SUP não é obrigatório. Só cadastre enquadramentos realmente utilizados.
6. Evidências operacionais ficam protegidas e podem ser vinculadas à unidade física.

## Ciclo completo do pedido

| Ação | Estado de origem permitido | Resultado | Efeito no estoque |
|---|---|---|---|
| Criação | — | Em análise | Cria bloqueios temporários `held`. |
| Confirmar reserva | Em análise ou Aprovado | Aprovado | Unidades `reserved`. |
| Iniciar preparação | Aprovado ou Em preparação | Em preparação | Unidades `preparing`. |
| Registrar entrega | Aprovado, Em preparação ou Em locação | Em locação | Unidades `rented`. |
| Registrar devolução | Em locação ou Devolvido | Devolvido | Encerra alocações e marca unidades `inspection`. |
| Cancelar | Em análise, Aprovado, Em preparação ou Em locação | Cancelado | Libera alocações e registra o motivo. |

Depois da devolução, a unidade deve seguir para higienização ou manutenção. O objetivo final é chegar a `available`, `unavailable` ou `retired`, sempre com histórico.

## Papéis e permissões

- **Visitante:** usa o site público e pode criar orçamento; não acessa dados privados.
- **Cliente:** acessa apenas a própria conta e pedidos vinculados, além das ações de experiência permitidas.
- **Administrador:** acessa os módulos protegidos e executa mutações administrativas.

A versão atual possui os papéis autenticados `client` e `admin`. Não existe política granular implementada para trocar papel, bloquear conta ou delegar permissões parciais; a tela de usuários permanece de consulta.

## Ajuda contextual

O cabeçalho do painel possui **Ajuda desta tela**. A janela resume:

- a responsabilidade do módulo atual;
- a fonte oficial usada pela tela;
- os efeitos das ações;
- quais seções da Central de ajuda consultar.
