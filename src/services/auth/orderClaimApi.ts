import type { AuthUser } from "../../domain/auth/types";
import { apiRequest } from "../api/apiClient";

export interface OrderClaimStartResponse {
  claimId: string;
  channel: "email";
  destinationMasked: string;
  expiresAt: string;
  retryAfterSeconds: number;
  developmentCode?: string;
}

export type OrderClaimVerifyResponse =
  | {
      accountExists: true;
      linkedQuoteCount: number;
      loginIdentifier: string;
    }
  | {
      accountExists: false;
      claimToken: string;
      profile: {
        name: string;
        email: string;
        cpf: string;
        phone: string | null;
      };
    };

export type OrderClaimCompleteResponse =
  | {
      accountExists: true;
      linkedQuoteCount: number;
      loginIdentifier: string;
    }
  | {
      accountExists: false;
      user: AuthUser;
      linkedQuoteCount: number;
    };

export async function startOrderClaim(quoteCode: string, cpf: string): Promise<OrderClaimStartResponse> {
  return await apiRequest<OrderClaimStartResponse>("/auth/claim-order", {
    method: "POST",
    body: JSON.stringify({ quoteCode, cpf }),
  });
}

export async function verifyOrderClaim(claimId: string, code: string): Promise<OrderClaimVerifyResponse> {
  return await apiRequest<OrderClaimVerifyResponse>("/auth/claim-order/verify", {
    method: "POST",
    body: JSON.stringify({ claimId, code }),
  });
}

export async function completeOrderClaim(claimToken: string, password: string): Promise<OrderClaimCompleteResponse> {
  return await apiRequest<OrderClaimCompleteResponse>("/auth/claim-order/complete", {
    method: "POST",
    body: JSON.stringify({ claimToken, password }),
  });
}
