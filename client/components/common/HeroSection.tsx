import Link from "next/link";
import { ArrowRight, Wallet, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#F7931A]/6 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Powered by x402 Protocol on Stacks</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Pay-per-use AI skills{" "}
            <span className="bg-gradient-to-r from-primary to-[#F7931A] bg-clip-text text-transparent">
              on Bitcoin
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Discover and execute AI-powered services with STX micropayments.
            No subscriptions. No API keys. No accounts. Just connect, pay, and go.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href="/skills">
                <Sparkles className="h-4 w-4" />
                Browse Skills
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-8">
              <Link href="/docs">
                Read Docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              <span>Hiro &middot; Leather &middot; Xverse</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#F7931A]" />
              <span>Secured by Bitcoin</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              <span>Atomic settlements</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
