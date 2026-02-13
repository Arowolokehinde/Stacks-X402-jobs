// ── STX Formatting ─────────────────────────────────────────

/** Convert microSTX (integer) → STX (decimal) */
export function microSTXtoSTX(microSTX: number): number {
  return microSTX / 1_000_000;
}

/** Convert STX (decimal) → microSTX (integer) */
export function stxToMicroSTX(stx: number): number {
  return Math.round(stx * 1_000_000);
}

/**
 * Format STX amount for display.
 * - `formatSTX(100000)` → "0.1 STX"
 * - `formatSTX(2000000)` → "2 STX"
 * - `formatSTX(250000)` → "0.25 STX"
 */
export function formatSTX(microSTX: number): string {
  const stx = microSTXtoSTX(microSTX);
  // Remove trailing zeros: 0.10 → 0.1, 2.00 → 2
  const formatted = stx % 1 === 0 ? stx.toString() : stx.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  return `${formatted} STX`;
}

// ── Address Formatting ─────────────────────────────────────

/**
 * Truncate a Stacks address for display.
 * `SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` → `SP2P…PGZGM`
 */
export function truncateAddress(address: string, start = 4, end = 5): string {
  if (!address || address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

// ── Number Formatting ──────────────────────────────────────

/**
 * Format large numbers with K/M/B suffixes.
 * - `formatNumber(1500)` → "1.5K"
 * - `formatNumber(2500000)` → "2.5M"
 * - `formatNumber(42)` → "42"
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return num.toString();
}

// ── Time Formatting ────────────────────────────────────────

/**
 * Format a unix timestamp (seconds or ms) to relative time.
 * - `formatTimestamp(Date.now() - 60000)` → "1m ago"
 * - `formatTimestamp(Date.now() - 3600000)` → "1h ago"
 */
export function formatTimestamp(timestamp: number): string {
  // Normalize to ms
  const ts = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const diff = Date.now() - ts;

  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(ts).toLocaleDateString();
}

/**
 * Format milliseconds to human-readable duration.
 * - `formatDuration(1500)` → "1.5s"
 * - `formatDuration(250)` → "250ms"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1).replace(/\.0$/, "")}s`;
}
