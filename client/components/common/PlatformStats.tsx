import { Layers, Zap, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  {
    label: "Skills Available",
    value: "5",
    icon: Layers,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Total Executions",
    value: "0",
    sublabel: "Live on testnet",
    icon: Zap,
    color: "text-[#F7931A]",
    bg: "bg-[#F7931A]/10",
  },
  {
    label: "STX Settled",
    value: "0",
    sublabel: "Atomic via x402",
    icon: Coins,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export function PlatformStats() {
  return (
    <section className="border-y border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Platform Stats
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real-time marketplace activity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold tabular-nums">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className="text-xs text-muted-foreground/60 mt-0.5">
                    {stat.sublabel}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
