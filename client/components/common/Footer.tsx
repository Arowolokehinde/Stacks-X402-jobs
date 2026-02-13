import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/common/Logo";

const FOOTER_LINKS = {
  Product: [
    { label: "Skills", href: "/skills" },
    { label: "Documentation", href: "/docs" },
  ],
  Protocol: [
    { label: "x402 Protocol", href: "https://www.x402.org", external: true },
    { label: "x402-stacks SDK", href: "https://github.com/tony1908/x402Stacks", external: true },
    { label: "Facilitator", href: "https://facilitator.stacksx402.com", external: true },
  ],
  Stacks: [
    { label: "Stacks Docs", href: "https://docs.stacks.co", external: true },
    { label: "Hiro Explorer", href: "https://explorer.hiro.so", external: true },
    { label: "Testnet Faucet", href: "https://explorer.hiro.so/sandbox/faucet?chain=testnet", external: true },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center">
              <Logo size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              Pay-per-use AI skills marketplace on Stacks. No subscriptions, no API keys.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-[#F7931A]" />
              Built on Stacks &middot; Secured by Bitcoin
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} x402.skills. Open source.</p>
          <p>
            Powered by{" "}
            <a
              href="https://www.x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              x402 Protocol
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
