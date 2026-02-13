import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSuffix?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { mark: 24, text: "text-sm", gap: "gap-1.5" },
  md: { mark: 32, text: "text-base", gap: "gap-2" },
  lg: { mark: 44, text: "text-xl", gap: "gap-2.5" },
} as const;

export function Logo({ className, showSuffix = true, size = "md" }: LogoProps) {
  const cfg = sizeConfig[size];

  return (
    <span className={cn("inline-flex items-center", cfg.gap, className)}>
      <GatewayMark size={cfg.mark} />
      {showSuffix && (
        <span className={cn("font-medium tracking-tight", cfg.text)}>
          <span className="text-foreground">CDII</span>
          <span className="text-muted-foreground font-light">.skills</span>
        </span>
      )}
    </span>
  );
}

/**
 * "The Gateway" — CDII Protocol Mark
 *
 * C + D = Two mirrored arcs forming a portal (payment gateway)
 * I + I = Twin vertical bars (pillars / settlement rails)
 * Orange diamond = Value node at the gateway center
 * Orange bar = Foundation connecting the pillars
 *
 * Reads as a payment protocol icon — value flowing through a gateway.
 * CDII = 402 in Roman numerals.
 */
function GatewayMark({ size }: { size: number }) {
  const scale = size / 48;

  return (
    <svg
      width={size * 1.1}
      height={size}
      viewBox="0 0 52 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CDII — 402 in Roman numerals"
      style={{ minWidth: size * 1.1 }}
    >
      {/* C arc — left gateway curve */}
      <path
        d="M17 6 C6 6 1 14 1 24 1 34 6 42 17 42"
        className="stroke-primary"
        strokeWidth={3 * scale + 0.8}
        strokeLinecap="round"
        fill="none"
      />
      {/* D arc — right gateway curve */}
      <path
        d="M17 6 C28 6 33 14 33 24 33 34 28 42 17 42"
        className="stroke-primary"
        strokeWidth={3 * scale + 0.8}
        strokeLinecap="round"
        fill="none"
      />
      {/* Orange diamond — value node */}
      <rect
        x="13.75"
        y="20.75"
        width="6.5"
        height="6.5"
        rx="1.2"
        transform="rotate(45 17 24)"
        fill="#F7931A"
      />
      {/* I pillar 1 */}
      <line
        x1="40" y1="8" x2="40" y2="36"
        className="stroke-primary"
        strokeWidth={3 * scale + 0.8}
        strokeLinecap="round"
      />
      {/* I pillar 2 */}
      <line
        x1="48" y1="8" x2="48" y2="36"
        className="stroke-primary"
        strokeWidth={3 * scale + 0.8}
        strokeLinecap="round"
      />
      {/* Settlement bar */}
      <rect x="37.5" y="40" width="13" height="2.5" rx="1.25" fill="#F7931A" />
    </svg>
  );
}
