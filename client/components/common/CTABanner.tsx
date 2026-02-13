import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-[#F7931A]/5 p-8 sm:p-12">
        {/* Background accents */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F7931A]/5 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <Code2 className="h-3 w-3" />
              For Developers & AI Agents
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Integrate skills into your app
            </h2>
            <p className="mt-2 text-muted-foreground">
              Use the x402-stacks SDK to call any skill programmatically.
              AI agents can discover, pay, and execute — fully autonomous.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/docs">
                Read the Docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a
                href="https://github.com/tony1908/x402Stacks"
                target="_blank"
                rel="noopener noreferrer"
              >
                View SDK
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
