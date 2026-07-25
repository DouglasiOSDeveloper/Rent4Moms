import type { Page } from "../../../domain/shared/types";

export interface AdminHelpTopic {
  title: string;
  purpose: string;
  actions: string[];
  effects: string[];
  relatedSections: string[];
}

export interface ModuleGuide {
  page: Page;
  label: string;
  group: "Principal" | "Operações" | "Gestão";
  purpose: string;
  sourceOfTruth: string;
  keyEffects: string[];
}

export interface MediaLocationGuide {
  owner: string;
  location: string;
  publicUse: string;
  rules: string[];
}

export interface StatusGuide {
  code: string;
  label: string;
  effect: string;
  next: string;
}

export interface StatusGroupGuide {
  id: string;
  title: string;
  statuses: StatusGuide[];
}

export interface RunbookGuide {
  id: string;
  title: string;
  when: string;
  steps: string[];
  expectedResult: string;
}

export const ADMIN_MODULES: ModuleGuide[] = [
  { page: "admin", label: "Dashboard", group: "Principal", purpose: "Exibir KPIs e pendências calculados a partir de pedidos, estoque e operações persistidos.", sourceOfTruth: "GET /api/v1/admin/dashboard", keyEffects: ["Não altera dados.", "Os atalhos levam às filas administrativas correspondentes."] },
  { page: "admin-products", label: "Produtos", group: "Principal", purpose: "Cadastrar e publicar o produto comercial, seus preços por período e suas fotos.", sourceOfTruth: "Catálogo normalizado e regras oficiais de preço", keyEffects: ["Publicação válida torna o produto elegível ao catálogo público.", "Alterações futuras não reescrevem snapshots de pedidos antigos."] },
  { page: "admin-configurator", label: "Montagem 4moms", group: "Principal", purpose: "Gerir modelos, panos, redutores, bolinhas, compatibilidades, variantes, angulações e mídias.", sourceOfTruth: "Entidades do catálogo, compatibilidades e media_assets", keyEffects: ["Uma variante publicada precisa de ao menos uma foto pública válida.", "Remover vínculos pode bloquear ou despublicar dependências, mas não altera pedidos antigos."] },
  { page: "admin-categories", label: "Categorias", group: "Principal", purpose: "Organizar produtos e filtros do catálogo.", sourceOfTruth: "Categorias persistidas e vínculos com produtos", keyEffects: ["Categorias ativas aparecem nos filtros e na navegação pública quando possuem conteúdo publicado."] },
  { page: "admin-quotes", label: "Orçamentos", group: "Principal", purpose: "Analisar pedidos, registrar pagamento, avançar o ciclo operacional, anexar evidências e consultar a timeline.", sourceOfTruth: "Pedidos, alocações, pagamentos, eventos e anexos", keyEffects: ["Ações de ciclo alteram o status do pedido e das unidades alocadas.", "Toda evidência e mutação relevante gera histórico operacional."] },
  { page: "admin-reservations", label: "Reservas e locações", group: "Principal", purpose: "Acompanhar pedidos já aprovados, em preparação, em locação ou devolvidos.", sourceOfTruth: "GET /api/v1/admin/reservations", keyEffects: ["É uma fila de acompanhamento; a execução das ações ocorre no detalhe do pedido."] },
  { page: "admin-inventory", label: "Estoque físico", group: "Principal", purpose: "Cadastrar, atualizar e rastrear cada unidade física.", sourceOfTruth: "inventory_units, alocações e movimentações", keyEffects: ["Somente unidades disponíveis entram na disponibilidade pública.", "Alterar estado registra movimentação e pode retirar a unidade da venda futura."] },
  { page: "admin-clients", label: "Clientes", group: "Principal", purpose: "Consolidar contas e compradores anônimos encontrados em pedidos reais.", sourceOfTruth: "Usuários e pedidos persistidos", keyEffects: ["Não cria clientes fictícios e não altera pedidos."] },
  { page: "admin-calendar", label: "Calendário", group: "Operações", purpose: "Exibir inícios e devoluções extraídos das datas persistidas nos itens dos pedidos.", sourceOfTruth: "GET /api/v1/admin/calendar", keyEffects: ["Não grava agenda paralela nem cria eventos demonstrativos."] },
  { page: "admin-delivery", label: "Entregas", group: "Operações", purpose: "Acompanhar preparação, entrega e devolução, com responsáveis e evidências.", sourceOfTruth: "Pedidos e eventos operacionais", keyEffects: ["Entrega muda o pedido para Em locação e as unidades para rented.", "Devolução encerra as alocações e envia as unidades diretamente para inspection."] },
  { page: "admin-hygiene", label: "Higienização", group: "Operações", purpose: "Controlar lavagem, secagem, inspeção e aprovação de unidades devolvidas.", sourceOfTruth: "hygiene_jobs e inventory_units", keyEffects: ["Aprovação devolve a unidade para available.", "Rejeição envia a unidade para maintenance."] },
  { page: "admin-maintenance", label: "Manutenção", group: "Operações", purpose: "Registrar diagnóstico, reparo, teste, custo e resultado de manutenção.", sourceOfTruth: "maintenance_jobs e inventory_units", keyEffects: ["Conclusão devolve a unidade para available.", "Sem reparo marca a unidade como unavailable."] },
  { page: "admin-customer-experience", label: "Experiência do cliente", group: "Gestão", purpose: "Decidir renovações, moderar avaliações e tratar solicitações de suporte.", sourceOfTruth: "Renovações, avaliações e suporte persistidos", keyEffects: ["Renovação aprovada altera a data efetiva, sem gratuidade promocional.", "Avaliação publicada participa da média pública."] },
  { page: "admin-reports", label: "Relatórios", group: "Gestão", purpose: "Consultar e exportar dados persistidos com filtros.", sourceOfTruth: "GET /api/v1/admin/reports e exportação CSV", keyEffects: ["Não armazena nem completa séries históricas inventadas."] },
  { page: "admin-users", label: "Usuários", group: "Gestão", purpose: "Consultar contas e papéis persistidos.", sourceOfTruth: "GET /api/v1/admin/users", keyEffects: ["A etapa atual é somente leitura; não inventa política de bloqueio ou papel granular."] },
  { page: "admin-content", label: "Conteúdo do site", group: "Gestão", purpose: "Gerir contatos, horários, integrações e páginas legais versionadas.", sourceOfTruth: "CMS persistido", keyEffects: ["Somente conteúdo pronto/publicado aparece no site.", "Rascunho ou não configurado não vira informação pública fictícia."] },
  { page: "admin-config", label: "Configurações", group: "Gestão", purpose: "Definir entrega e parâmetros oficiais do frete por rota.", sourceOfTruth: "delivery_settings e shipping_settings", keyEffects: ["Novas configurações afetam estimativas futuras.", "Pedidos antigos preservam o snapshot logístico usado no cálculo."] },
  { page: "admin-help", label: "Ajuda operacional", group: "Gestão", purpose: "Reunir mapa de módulos, fotos, status, gatilhos, permissões e runbooks.", sourceOfTruth: "Documentação versionada da Etapa I", keyEffects: ["Não altera dados operacionais."] },
];

export const MEDIA_LOCATIONS: MediaLocationGuide[] = [
  { owner: "Produto", location: "Admin > Produtos > abrir/cadastrar produto > Fotos", publicUse: "Capa, card, galeria e compartilhamento do produto.", rules: ["JPG, PNG ou WebP.", "Marque Visível no site para publicar.", "Defina uma imagem principal quando houver mais de uma."] },
  { owner: "Modelo de cadeira", location: "Admin > Montagem 4moms > Modelos > abrir modelo > Fotos", publicUse: "Referência visual e fallback técnico do configurador.", rules: ["A foto pertence ao modelo, não à variante.", "Não substitui as angulações da composição."] },
  { owner: "Pano", location: "Admin > Montagem 4moms > Panos > abrir pano > Fotos", publicUse: "Miniatura de seleção e detalhe do pano.", rules: ["Cadastre texto alternativo descritivo.", "A compatibilidade é gerida separadamente."] },
  { owner: "Redutor", location: "Admin > Montagem 4moms > Redutores > abrir redutor > Fotos", publicUse: "Miniatura de seleção e detalhe do redutor.", rules: ["A mídia não cria vínculo automático com modelos."] },
  { owner: "Bolinhas", location: "Admin > Montagem 4moms > Bolinhas > abrir conjunto > Fotos", publicUse: "Referência visual do conjunto automático.", rules: ["Associe o conjunto ao modelo correto antes da publicação da variante."] },
  { owner: "Variante / angulação", location: "Admin > Montagem 4moms > Variantes > abrir variante > Fotos", publicUse: "Galeria principal da composição selecionada.", rules: ["Selecione uma angulação ativa.", "Ao menos uma foto pública válida é necessária para publicar.", "SUP não é obrigatório; use apenas ângulos reais cadastrados."] },
  { owner: "Entrega, devolução, avaria, higienização, manutenção ou documento", location: "Admin > Orçamentos > abrir pedido > Evidências", publicUse: "Prova operacional e histórico do pedido; a visibilidade depende do tipo.", rules: ["Vincule à unidade quando aplicável.", "Arquivos operacionais ficam protegidos e exigem sessão autorizada."] },
];

export const QUOTE_LIFECYCLE = [
  { action: "Criação do orçamento", from: "—", to: "Em análise", effect: "O backend recalcula preço e frete, grava snapshots e cria bloqueios temporários de estoque." },
  { action: "Confirmar reserva", from: "Em análise ou Aprovado", to: "Aprovado", effect: "Unidades alocadas passam para reserved e a reserva fica confirmada." },
  { action: "Iniciar preparação", from: "Aprovado ou Em preparação", to: "Em preparação", effect: "Unidades alocadas passam para preparing." },
  { action: "Registrar entrega", from: "Aprovado, Em preparação ou Em locação", to: "Em locação", effect: "Unidades passam para rented e a locação fica ativa." },
  { action: "Registrar devolução", from: "Em locação ou Devolvido", to: "Devolvido", effect: "Alocações são encerradas e unidades passam diretamente para inspection, prontas para o tratamento pós-devolução." },
  { action: "Cancelar", from: "Em análise, Aprovado, Em preparação ou Em locação", to: "Cancelado", effect: "Alocações são liberadas; o estoque retorna conforme a ação transacional e o motivo fica registrado." },
] as const;

export const STATUS_GROUPS: StatusGroupGuide[] = [
  { id: "pedidos", title: "Pedidos", statuses: [
    { code: "Em análise", label: "Em análise", effect: "Pedido criado com preço/frete oficiais e estoque temporariamente bloqueado.", next: "Confirmar reserva ou cancelar." },
    { code: "Aprovado", label: "Aprovado", effect: "Reserva confirmada; unidades ficam reservadas.", next: "Iniciar preparação, registrar entrega ou cancelar." },
    { code: "Em preparação", label: "Em preparação", effect: "Unidades estão sendo separadas e conferidas.", next: "Registrar entrega ou cancelar." },
    { code: "Em locação", label: "Em locação", effect: "Entrega registrada; unidades estão alugadas.", next: "Registrar devolução ou tratar renovação válida." },
    { code: "Devolvido", label: "Devolvido", effect: "Alocações encerradas; unidades aguardam fluxo de inspeção, higienização ou manutenção.", next: "Criar higienização/manutenção conforme avaliação." },
    { code: "Cancelado", label: "Cancelado", effect: "Pedido interrompido e alocações liberadas.", next: "Nenhum avanço operacional; consulte a timeline." },
    { code: "Expirado", label: "Expirado", effect: "Bloqueio temporário venceu antes do processamento.", next: "Criar nova solicitação quando necessário." },
  ] },
  { id: "estoque", title: "Unidades físicas", statuses: [
    { code: "available", label: "Disponível", effect: "Conta na disponibilidade pública e pode ser alocada.", next: "held ao criar um orçamento compatível." },
    { code: "held", label: "Bloqueada", effect: "Separada temporariamente por um orçamento; ainda não é reserva confirmada.", next: "reserved ou available após expiração/liberação." },
    { code: "reserved", label: "Reservada", effect: "Vinculada a um pedido aprovado.", next: "preparing ou available se liberada." },
    { code: "preparing", label: "Em preparação", effect: "Em separação para entrega.", next: "rented." },
    { code: "rented", label: "Em locação", effect: "Está com o cliente e não pode ser alocada novamente.", next: "inspection pelo fluxo de devolução." },
    { code: "returned", label: "Devolvida", effect: "Retornou da locação e aguarda tratamento operacional.", next: "inspection, washing ou maintenance." },
    { code: "inspection", label: "Em inspeção", effect: "Aguardando aprovação após higienização.", next: "available ou maintenance." },
    { code: "washing", label: "Em lavagem", effect: "Em processo de higienização.", next: "inspection, available ou maintenance conforme o job." },
    { code: "maintenance", label: "Em manutenção", effect: "Bloqueada para diagnóstico/reparo.", next: "available ou unavailable." },
    { code: "unavailable", label: "Indisponível", effect: "Não entra na disponibilidade pública.", next: "Retorno manual ou por manutenção concluída, quando seguro." },
    { code: "retired", label: "Baixada", effect: "Retirada definitivamente do uso operacional.", next: "Sem nova alocação." },
  ] },
  { id: "higiene", title: "Higienização", statuses: [
    { code: "waiting", label: "Aguardando", effect: "Unidade permanece em washing.", next: "in_progress." },
    { code: "in_progress", label: "Em andamento", effect: "Lavagem em execução; unidade permanece washing.", next: "drying." },
    { code: "drying", label: "Secagem", effect: "Unidade permanece washing.", next: "inspection." },
    { code: "inspection", label: "Inspeção", effect: "Unidade passa para inspection.", next: "approved ou rejected." },
    { code: "approved", label: "Aprovada", effect: "Unidade volta para available.", next: "Pode ser alocada novamente." },
    { code: "rejected", label: "Rejeitada", effect: "Unidade passa para maintenance.", next: "Abrir/manter fluxo de manutenção." },
  ] },
  { id: "manutencao", title: "Manutenção", statuses: [
    { code: "open", label: "Aberta", effect: "Unidade permanece maintenance.", next: "diagnosing." },
    { code: "diagnosing", label: "Em diagnóstico", effect: "Problema está sendo avaliado.", next: "waiting_parts, repairing ou testing." },
    { code: "waiting_parts", label: "Aguardando peças", effect: "Unidade permanece indisponível para locação.", next: "repairing." },
    { code: "repairing", label: "Em reparo", effect: "Unidade permanece maintenance.", next: "testing." },
    { code: "testing", label: "Em teste", effect: "Validação final antes do retorno.", next: "completed ou unrepairable." },
    { code: "completed", label: "Concluída", effect: "Unidade volta para available.", next: "Pode ser alocada novamente." },
    { code: "unrepairable", label: "Sem reparo", effect: "Unidade passa para unavailable.", next: "Avaliar baixa definitiva no estoque." },
  ] },
  { id: "pagamentos", title: "Pagamentos", statuses: [
    { code: "pending", label: "Pendente", effect: "Nenhum recebimento integral registrado.", next: "partial, received ou refunded conforme conciliação." },
    { code: "partial", label: "Parcial", effect: "Parte do valor foi recebida.", next: "received ou refunded." },
    { code: "received", label: "Recebido", effect: "Recebimento registrado na timeline.", next: "refunded se houver estorno." },
    { code: "refunded", label: "Estornado", effect: "Valor registrado como devolvido/estornado.", next: "Revisar pedido e observações." },
  ] },
  { id: "experiencia", title: "Experiência do cliente", statuses: [
    { code: "renewal:pending", label: "Renovação pendente", effect: "Aguardando decisão administrativa; promoção/gratuidade não é aplicada.", next: "approved, rejected ou cancelled." },
    { code: "review:published", label: "Avaliação publicada", effect: "Participa da média pública do produto.", next: "hidden ou rejected se a moderação mudar." },
    { code: "support:open", label: "Suporte aberto", effect: "Solicitação entra na fila administrativa.", next: "in_progress e depois closed." },
  ] },
];

export const PERMISSION_GUIDE = [
  { role: "Visitante", access: "Site público, catálogo, produto e criação de orçamento.", restrictions: "Não acessa dados privados, anexos ou administração." },
  { role: "Cliente", access: "Conta própria, pedidos vinculados, timeline e anexos permitidos; pode solicitar renovação, avaliação e suporte quando elegível.", restrictions: "Não acessa pedidos de terceiros nem endpoints administrativos." },
  { role: "Administrador", access: "Módulos administrativos, catálogo, estoque, pedidos, operações, conteúdo e configurações.", restrictions: "A versão atual possui papel admin único; permissões granulares e alteração de papéis ainda não foram definidas." },
] as const;

export const RUNBOOKS: RunbookGuide[] = [
  { id: "publicar-produto", title: "Publicar produto configurável", when: "Ao cadastrar um novo item da linha 4moms.", steps: ["Cadastre o produto e suas regras de 30/60/90 dias.", "Cadastre ou vincule o modelo, panos, redutores e bolinhas reais.", "Configure compatibilidades sem forçar vínculos inexistentes.", "Cadastre angulações reais e envie as fotos da variante.", "Crie unidades físicas no Estoque; não edite quantidade no catálogo.", "Revise a composição e publique somente quando os campos e a mídia estiverem válidos."], expectedResult: "O produto aparece no site somente quando publicado e com disponibilidade derivada do estoque real." },
  { id: "processar-pedido", title: "Processar pedido até a devolução", when: "Quando um orçamento real entra em análise.", steps: ["Abra o pedido e confira seleção, período, endereço, preço e frete oficiais.", "Registre o pagamento ou observação necessária.", "Confirme a reserva para tornar as unidades reserved.", "Inicie a preparação e registre evidências quando necessário.", "Registre a entrega para iniciar a locação.", "Na devolução, anexe as fotos e registre a ação Devolver.", "Encaminhe cada unidade à higienização ou manutenção conforme a inspeção."], expectedResult: "A timeline registra o ciclo e cada unidade termina available, unavailable ou retired conforme o tratamento." },
  { id: "higienizar", title: "Higienizar unidade devolvida", when: "Após a devolução, sem alocação ativa.", steps: ["Crie o job para a unidade e informe responsável.", "Avance por lavagem, secagem e inspeção.", "Anexe evidências no pedido quando aplicável.", "Aprove somente após checklist e inspeção.", "Rejeite quando houver problema que exija manutenção."], expectedResult: "Aprovada retorna a available; rejeitada passa para maintenance." },
  { id: "manutencao", title: "Tratar manutenção", when: "Quando a unidade apresentar avaria, falhar na higienização ou precisar de prevenção.", steps: ["Abra o job e descreva o problema e o tipo.", "Registre diagnóstico, responsável e custo quando houver.", "Avance por reparo e teste.", "Marque completed apenas após validação segura.", "Marque unrepairable quando não puder voltar ao uso."], expectedResult: "Completed retorna a available; unrepairable passa para unavailable para decisão de baixa." },
  { id: "api-offline", title: "Tratar API indisponível", when: "Quando uma tela mostrar estado de erro/offline.", steps: ["Não cadastre dados locais nem use placeholders para contornar a falha.", "Verifique a saúde da API e do PostgreSQL.", "Confirme variáveis de ambiente, CORS e sessão.", "Use o botão de tentar novamente após restaurar o serviço.", "Consulte logs pelo requestId quando a falha persistir."], expectedResult: "A interface volta a carregar a fonte oficial sem ressuscitar dados locais." },
  { id: "frete", title: "Revisar divergência de frete", when: "Quando a distância ou o valor não corresponder ao endereço informado.", steps: ["Confira a origem logística e os parâmetros em Configurações.", "Confirme CEP, rua, número, cidade e estado do destino.", "Refaça a estimativa pelo fluxo normal.", "Compare distância, combustível, multiplicador, taxa mínima e ida/volta no snapshot.", "Não sobrescreva o valor no navegador; corrija a configuração ou o endereço e recalcule."], expectedResult: "O valor persistido é o recalculado pelo servidor e mantém snapshot auditável." },
];

const TOPICS: Partial<Record<Page, AdminHelpTopic>> = Object.fromEntries(
  ADMIN_MODULES.map((module) => [module.page, {
    title: module.label,
    purpose: module.purpose,
    actions: [module.sourceOfTruth],
    effects: module.keyEffects,
    relatedSections: module.page === "admin-products" || module.page === "admin-configurator" ? ["Mapa de fotos", "Publicação de produto"]
      : module.page === "admin-quotes" || module.page === "admin-delivery" ? ["Ciclo do pedido", "Evidências operacionais"]
      : module.page === "admin-hygiene" ? ["Status de higienização", "Runbook de higienização"]
      : module.page === "admin-maintenance" ? ["Status de manutenção", "Runbook de manutenção"]
      : ["Mapa de módulos", "Glossário de status"],
  }]),
);

TOPICS["admin-order"] = {
  title: "Detalhe do pedido",
  purpose: "Executar ações transacionais do pedido, consultar unidades, pagamento, evidências e timeline.",
  actions: ["Registre pagamento, reserva, preparação, entrega, devolução ou cancelamento somente na sequência permitida."],
  effects: ["Cada ação atualiza pedido, unidades e eventos no backend.", "Fotos operacionais ficam em Evidências e podem ser vinculadas a uma unidade."],
  relatedSections: ["Ciclo do pedido", "Mapa de fotos", "Status de estoque"],
};

export function getAdminHelpTopic(page: Page): AdminHelpTopic {
  return TOPICS[page] ?? {
    title: "Ajuda administrativa",
    purpose: "Consulte a central operacional para entender módulos, status, fotos e gatilhos.",
    actions: ["Abra a central de ajuda pelo menu Gestão."],
    effects: ["A ajuda não altera dados."],
    relatedSections: ["Mapa de módulos"],
  };
}
