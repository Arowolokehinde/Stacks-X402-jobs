"use client";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Radio,
  PenTool,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentState } from "@/types/payment";

const STEPS: {
  state: PaymentState;
  label: string;
  icon: typeof Loader2;
}[] = [
  { state: "signing", label: "Signing transaction…", icon: PenTool },
  { state: "broadcasting", label: "Broadcasting to network…", icon: Radio },
  { state: "confirming", label: "Confirming payment…", icon: Loader2 },
  { state: "executing", label: "Running skill…", icon: ArrowUpRight },
];

interface PaymentStatusProps {
  state: PaymentState;
  error?: string | null;
  txHash?: string | null;
  explorerUrl?: string | null;
}

export function PaymentStatus({
  state,
  error,
  txHash,
  explorerUrl,
}: PaymentStatusProps) {
  if (state === "idle") return null;

  // Success state
  if (state === "success") {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Payment settled &amp; skill executed</span>
        </div>
        {txHash && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono">{txHash.slice(0, 10)}…{txHash.slice(-6)}</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Payment failed</span>
        </div>
        {error && (
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        )}
      </div>
    );
  }

  // Progress states
  const currentIdx = STEPS.findIndex((s) => s.state === state);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2.5">
      {STEPS.map((step, i) => {
        const isActive = step.state === state;
        const isDone = i < currentIdx;
        const isPending = i > currentIdx;
        const StepIcon = step.icon;

        return (
          <div
            key={step.state}
            className={cn(
              "flex items-center gap-2.5 text-sm transition-opacity",
              isPending && "opacity-40"
            )}
          >
            {isDone ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : isActive ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <StepIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                isDone && "text-emerald-500",
                isActive && "text-primary font-medium",
                isPending && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
