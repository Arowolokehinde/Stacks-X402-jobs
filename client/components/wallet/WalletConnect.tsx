"use client";

import { Wallet, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/components/wallet/WalletProvider";
import { formatSTX } from "@/lib/utils/format";
import { getExplorerUrl, getFaucetUrl, getNetworkName } from "@/lib/stacks/network";

interface WalletConnectProps {
  /** Show full-width button (e.g. mobile menu) */
  fullWidth?: boolean;
}

export function WalletConnect({ fullWidth }: WalletConnectProps) {
  const {
    address,
    displayAddress,
    balanceMicroSTX,
    isConnecting,
    network,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  // ── Not connected ────────────────────────────────────────
  if (!address) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={fullWidth ? "w-full gap-2" : "gap-2"}
        onClick={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </Button>
    );
  }

  // ── Connected ────────────────────────────────────────────
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={fullWidth ? "w-full gap-2 justify-between" : "gap-2"}
        >
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-xs">{displayAddress}</span>
          </span>
          {balanceMicroSTX !== null && (
            <span className="text-xs text-muted-foreground ml-1">
              {formatSTX(balanceMicroSTX)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Balance */}
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="font-mono font-semibold">
            {balanceMicroSTX !== null ? formatSTX(balanceMicroSTX) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {network}
          </p>
        </div>

        <DropdownMenuSeparator />

        {/* Explorer link */}
        <DropdownMenuItem asChild>
          <a
            href={getExplorerUrl(address).replace(/\/txid\/.*/, `/address/${address}?chain=${network}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Explorer
          </a>
        </DropdownMenuItem>

        {/* Faucet link (testnet only) */}
        {getNetworkName() === "testnet" && (
          <DropdownMenuItem asChild>
            <a
              href={getFaucetUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Wallet className="h-3.5 w-3.5" />
              Testnet Faucet
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Disconnect */}
        <DropdownMenuItem
          onClick={disconnectWallet}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
