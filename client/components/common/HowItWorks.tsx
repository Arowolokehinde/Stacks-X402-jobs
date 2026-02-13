import { Wallet, MousePointerClick, CreditCard } from "lucide-react";

const STEPS = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your Hiro, Leather, or Xverse wallet in one click. No sign-up needed.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MousePointerClick,
    title: "Pick a Skill",
    description: "Browse the marketplace and find the AI skill you need. See pricing upfront.",
    color: "text-[#F7931A]",
    bg: "bg-[#F7931A]/10",
  },
  {
    icon: CreditCard,
    title: "Pay & Execute",
    description: "Confirm one STX payment. The skill runs instantly and returns your result.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Three steps from discovery to execution. No accounts, no subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative text-center">
            {/* Connector line (desktop only) */}
            {i < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-border" />
            )}

            {/* Step icon */}
            <div className="relative mx-auto mb-4">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg}`}>
                <step.icon className={`h-7 w-7 ${step.color}`} />
              </div>
              {/* Step number */}
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                {i + 1}
              </span>
            </div>

            <h3 className="font-semibold text-base mb-1.5">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
