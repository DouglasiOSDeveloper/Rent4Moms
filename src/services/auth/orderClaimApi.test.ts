import { completeOrderClaim, startOrderClaim, verifyOrderClaim } from "./orderClaimApi";

describe("order claim API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts a claim with the order code and CPF", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      claimId: "11111111-1111-4111-8111-111111111111",
      channel: "email",
      destinationMasked: "cl*****@teste.local",
      expiresAt: "2030-01-01T10:10:00.000Z",
      retryAfterSeconds: 60,
      developmentCode: "123456",
    }), { status: 201, headers: { "Content-Type": "application/json" } }));

    const result = await startOrderClaim("ORC-2030-ABCDEF12", "529.982.247-25");
    expect(result.developmentCode).toBe("123456");
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/auth/claim-order", expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ quoteCode: "ORC-2030-ABCDEF12", cpf: "529.982.247-25" }),
    }));
  });

  it("verifies a code and returns the profile recovered from the order", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      accountExists: false,
      claimToken: "signed-claim-token",
      profile: { name: "Cliente", email: "cliente@teste.local", cpf: "52998224725", phone: "11999999999" },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const result = await verifyOrderClaim("11111111-1111-4111-8111-111111111111", "123456");
    expect(result.accountExists).toBe(false);
    if ("profile" in result) expect(result.profile.email).toBe("cliente@teste.local");
  });

  it("completes the account and receives the authenticated user", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      accountExists: false,
      linkedQuoteCount: 2,
      user: {
        id: "user-1",
        name: "Cliente",
        email: "cliente@teste.local",
        cpfDigits: "52998224725",
        phone: "11999999999",
        role: "client",
        createdAt: "2030-01-01T10:00:00.000Z",
      },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));

    const result = await completeOrderClaim("signed-claim-token", "Password123!");
    expect(result.accountExists).toBe(false);
    if ("user" in result) expect(result.linkedQuoteCount).toBe(2);
  });
});
