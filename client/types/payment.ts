// ── Payment State Machine ──────────────────────────────────
export type PaymentState =
  | "idle"
  | "signing"
  | "broadcasting"
  | "confirming"
  | "executing"
  | "success"
  | "error";

// ── Payment Requirement (from 402 response) ────────────────
export interface PaymentRequirement {
  x402Version: number;
  paymentRequirements: {
    network: string;          // e.g. "stacks:1" or "stacks:2147483648"
    amount: string;           // microSTX as string
    asset: {
      type: "native" | "contract";
      symbol: string;         // "STX" | "sBTC"
    };
    payTo: string;            // recipient Stacks address
    scheme: string;           // "x402-stacks"
    maxTimeoutSeconds: number;
    resource: string;         // e.g. "/api/skills/whale-tracker"
    description: string;
  };
}

// ── Payment Result (after successful settlement) ───────────
export interface PaymentResult {
  transactionHash: string;
  payer: string;
  network: string;
  amount: string;
  settledAt: number;         // unix timestamp ms
}

// ── Skill Execution Result ─────────────────────────────────
export interface SkillExecutionResult<T = unknown> {
  success: boolean;
  data: T;
  payment: PaymentResult;
  executionId: string;
  responseTimeMs: number;
}

// ── Payment Error ──────────────────────────────────────────
export interface PaymentError {
  code:
    | "WALLET_NOT_CONNECTED"
    | "INSUFFICIENT_BALANCE"
    | "USER_REJECTED"
    | "SIGNING_FAILED"
    | "BROADCAST_FAILED"
    | "CONFIRMATION_TIMEOUT"
    | "SETTLEMENT_FAILED"
    | "EXECUTION_FAILED"
    | "NETWORK_MISMATCH"
    | "UNKNOWN";
  message: string;
  details?: unknown;
}
