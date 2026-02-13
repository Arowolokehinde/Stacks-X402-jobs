import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";

export type StacksNetworkName = "mainnet" | "testnet";

export function getNetworkName(): StacksNetworkName {
  return (process.env.NEXT_PUBLIC_NETWORK as StacksNetworkName) || "testnet";
}

export function getNetwork() {
  return getNetworkName() === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;
}

export function getExplorerUrl(txId: string): string {
  const base = "https://explorer.hiro.so";
  const chain = getNetworkName();
  return `${base}/txid/${txId}?chain=${chain}`;
}

export function getHiroApiUrl(): string {
  return getNetworkName() === "mainnet"
    ? "https://api.mainnet.hiro.so"
    : "https://api.testnet.hiro.so";
}

export function getFaucetUrl(): string {
  return "https://explorer.hiro.so/sandbox/faucet?chain=testnet";
}
