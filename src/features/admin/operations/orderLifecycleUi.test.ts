import { describe, expect, it } from "vitest";
import { lifecycleActionState } from "./orderLifecycleUi";

describe("lifecycleActionState", () => {
  it("shows only the reservation action as available while the order is under analysis", () => {
    expect(lifecycleActionState("Em análise", "reserve")).toBe("available");
    expect(lifecycleActionState("Em análise", "prepare")).toBe("blocked");
  });

  it("marks the current and completed stages as the order advances", () => {
    expect(lifecycleActionState("Aprovado", "reserve")).toBe("current");
    expect(lifecycleActionState("Aprovado", "prepare")).toBe("available");
    expect(lifecycleActionState("Em preparação", "reserve")).toBe("completed");
    expect(lifecycleActionState("Em preparação", "prepare")).toBe("current");
    expect(lifecycleActionState("Em locação", "deliver")).toBe("current");
    expect(lifecycleActionState("Em locação", "return")).toBe("available");
    expect(lifecycleActionState("Devolvido", "return")).toBe("current");
  });

  it("blocks lifecycle changes after cancellation", () => {
    expect(lifecycleActionState("Cancelado", "cancel")).toBe("current");
    expect(lifecycleActionState("Cancelado", "reserve")).toBe("blocked");
  });
});
