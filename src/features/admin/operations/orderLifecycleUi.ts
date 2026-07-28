export type LifecycleActionId = "reserve" | "prepare" | "deliver" | "return" | "cancel";
export type LifecycleActionState = "available" | "current" | "completed" | "blocked";

const ACTION_STAGE: Record<Exclude<LifecycleActionId, "cancel">, number> = {
  reserve: 0,
  prepare: 1,
  deliver: 2,
  return: 3,
};

const STATUS_STAGE: Record<string, number> = {
  "Em análise": -1,
  "Aprovado": 0,
  "Em preparação": 1,
  "Em locação": 2,
  "Devolvido": 3,
  "Concluído": 4,
};

const ALLOWED_STATUSES: Record<LifecycleActionId, string[]> = {
  reserve: ["Em análise", "Aprovado"],
  prepare: ["Aprovado", "Em preparação"],
  deliver: ["Aprovado", "Em preparação", "Em locação"],
  return: ["Em locação", "Devolvido"],
  cancel: ["Em análise", "Aprovado", "Em preparação", "Em locação"],
};

export function lifecycleActionState(status: string, action: LifecycleActionId): LifecycleActionState {
  if (action === "cancel") {
    if (status === "Cancelado") return "current";
    return ALLOWED_STATUSES.cancel.includes(status) ? "available" : "blocked";
  }

  const currentStage = STATUS_STAGE[status];
  const actionStage = ACTION_STAGE[action];
  if (currentStage !== undefined) {
    if (actionStage < currentStage) return "completed";
    if (actionStage === currentStage) return "current";
  }

  return ALLOWED_STATUSES[action].includes(status) ? "available" : "blocked";
}
