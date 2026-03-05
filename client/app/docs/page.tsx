import Link from "next/link";
import {
  BookOpen,
  Code2,
  Zap,
  Wallet,
  ArrowRight,
  ExternalLink,
  Terminal,
  Shield,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAllSkills } from "@/lib/skills-config";
import { formatSTX } from "@/lib/utils/format";

function CodeBlock({ code, lang = "typescript" }: { code: string; lang?: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm font-mono leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold tracking-tight scroll-mt-20 flex items-center gap-2">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  const skills = getAllSkills();

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-4">
          <BookOpen className="h-3 w-3" />
          Documentation
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          x402.skills Documentation
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Everything you need to integrate pay-per-use AI skills into your app or
          agent using the x402 payment protocol on Stacks.
        </p>
      </div>

      {/* Table of Contents */}
      <Card className="mb-10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">On this page</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
            {[
              { href: "#overview", label: "Overview" },
              { href: "#how-it-works", label: "How x402 Works" },
              { href: "#quick-start", label: "Quick Start" },
              { href: "#api-reference", label: "API Reference" },
              { href: "#skills-catalog", label: "Skills Catalog" },
              { href: "#sdk", label: "SDK Integration" },
              { href: "#ai-agents", label: "AI Agent Integration" },
              { href: "#resources", label: "Resources & Links" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </CardContent>
      </Card>

      <div className="space-y-12">
        {/* ── Overview ────────────────────────────────────── */}
        <section>
          <SectionAnchor id="overview">
            <Layers className="h-5 w-5 text-primary" />
            Overview
          </SectionAnchor>
          <div className="mt-4 space-y-3 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">x402.skills</strong> is a
              decentralized marketplace for pay-per-use AI services (&ldquo;skills&rdquo;)
              built on the{" "}
              <a
                href="https://www.x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                x402 HTTP payment protocol
              </a>{" "}
              and the Stacks blockchain.
            </p>
            <p>
              Instead of subscriptions or API keys, each skill is a single HTTP
              endpoint that returns <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">402 Payment Required</code> until
              a valid STX micropayment is attached. The payment is settled
              atomically by a facilitator — you sign, we broadcast.
            </p>
            <p>
              No accounts. No API keys. No subscriptions. Just connect a wallet,
              pick a skill, pay, and get results.
            </p>
          </div>
        </section>

        <Separator />

        {/* ── How x402 Works ─────────────────────────────── */}
        <section>
          <SectionAnchor id="how-it-works">
            <Shield className="h-5 w-5 text-primary" />
            How x402 Works
          </SectionAnchor>
          <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The x402 protocol uses HTTP status <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">402</code> to signal
              that a resource requires payment. Here&rsquo;s the flow:
            </p>
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: "Client requests the skill endpoint",
                  desc: "GET /api/skills/whale-tracker",
                },
                {
                  step: 2,
                  title: "Server responds with 402",
                  desc: "Includes a payment-required header with amount, recipient, and network details (base64-encoded JSON).",
                },
                {
                  step: 3,
                  title: "Client signs an STX transfer",
                  desc: "The user's wallet signs (but does NOT broadcast) a transfer transaction matching the requirements.",
                },
                {
                  step: 4,
                  title: "Client retries with payment",
                  desc: "The signed tx is sent as a payment-signature header on the retry request.",
                },
                {
                  step: 5,
                  title: "Facilitator settles atomically",
                  desc: "The server forwards the signed tx to the facilitator, which broadcasts and confirms it on-chain.",
                },
                {
                  step: 6,
                  title: "Server returns the result",
                  desc: "200 OK with the skill output + a payment-response header containing the tx hash.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {s.step}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{s.title}</p>
                    <p className="text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <CodeBlock
              code={`// Simplified x402 flow
GET /api/skills/whale-tracker
→ 402 + payment-required: <base64 JSON>

// Client signs STX transfer (no broadcast)
→ wallet.signTransaction({ recipient, amount, memo })

// Retry with signed tx
GET /api/skills/whale-tracker
  payment-signature: <base64 PaymentPayloadV2>
→ 200 + { result } + payment-response: <base64 settlement>`}
            />
          </div>
        </section>

        <Separator />

        {/* ── Quick Start ────────────────────────────────── */}
        <section>
          <SectionAnchor id="quick-start">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start
          </SectionAnchor>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The fastest way to use a skill is through the browser UI:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "1",
                  title: "Connect wallet",
                  desc: "Click Connect Wallet in the navbar. Supports Hiro, Leather, and Xverse.",
                },
                {
                  step: "2",
                  title: "Go to a skill",
                  desc: "Browse /skills and pick one. Review the price and example I/O.",
                },
                {
                  step: "3",
                  title: "Execute",
                  desc: "Click Execute, confirm the STX payment in your wallet, get results.",
                },
              ].map((s) => (
                <Card key={s.step} className="border-border/50">
                  <CardContent className="p-4">
                    <span className="text-2xl font-bold text-primary">
                      {s.step}
                    </span>
                    <h3 className="font-semibold mt-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── API Reference ──────────────────────────────── */}
        <section>
          <SectionAnchor id="api-reference">
            <Code2 className="h-5 w-5 text-primary" />
            API Reference
          </SectionAnchor>
          <div className="mt-4 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              All skills are exposed as standard HTTP endpoints. Payment is
              handled entirely through HTTP headers — no custom auth needed.
            </p>

            {/* Headers table */}
            <div>
              <h3 className="font-semibold mb-2">x402 Headers</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Header</th>
                      <th className="px-4 py-2 text-left font-medium">Direction</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">payment-required</td>
                      <td className="px-4 py-2">Server → Client</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Base64 JSON with price, recipient, network (in 402 response)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">payment-signature</td>
                      <td className="px-4 py-2">Client → Server</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Base64 JSON with signed transaction bytes
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">payment-response</td>
                      <td className="px-4 py-2">Server → Client</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Base64 JSON with tx hash and settlement confirmation
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Endpoints */}
            <div>
              <h3 className="font-semibold mb-2">Endpoints</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Method</th>
                      <th className="px-4 py-2 text-left font-medium">Endpoint</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="text-xs font-mono">GET</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">/api/registry/skills</td>
                      <td className="px-4 py-2 text-muted-foreground">List all available skills (free)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="text-xs font-mono">GET/POST</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">/api/skills/[skillId]</td>
                      <td className="px-4 py-2 text-muted-foreground">Execute a skill (x402 payment required)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="text-xs font-mono">GET</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">/api/stats/global</td>
                      <td className="px-4 py-2 text-muted-foreground">Platform statistics (free)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example */}
            <div>
              <h3 className="font-semibold mb-2">Example: Call a Skill with cURL</h3>
              <CodeBlock
                code={`# Step 1: Get payment requirements
curl -i https://x402skills.com/api/skills/whale-tracker
# → HTTP 402
# → payment-required: eyJ4NDAy...

# Step 2: Sign tx with your wallet, then retry
curl https://x402skills.com/api/skills/whale-tracker \\
  -H "payment-signature: eyJ4NDAy..."
# → HTTP 200 + { whale_moves: [...], total_volume: "..." }`}
                lang="bash"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Skills Catalog ─────────────────────────────── */}
        <section>
          <SectionAnchor id="skills-catalog">
            <Layers className="h-5 w-5 text-primary" />
            Skills Catalog
          </SectionAnchor>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {skills.length} skills available at launch. Each is a standalone
              HTTP endpoint with x402 payment gating.
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Skill</th>
                    <th className="px-4 py-2 text-left font-medium">Category</th>
                    <th className="px-4 py-2 text-left font-medium">Price</th>
                    <th className="px-4 py-2 text-left font-medium">Method</th>
                    <th className="px-4 py-2 text-left font-medium">Data Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {skills.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2">
                        <Link
                          href={`/skills/${s.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 capitalize text-muted-foreground">
                        {s.category}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {formatSTX(s.priceMicroSTX)}
                      </td>
                      <td className="px-4 py-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {s.method}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {s.dataSource}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── SDK Integration ────────────────────────────── */}
        <section>
          <SectionAnchor id="sdk">
            <Terminal className="h-5 w-5 text-primary" />
            SDK Integration
          </SectionAnchor>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Use the{" "}
              <a
                href="https://www.npmjs.com/package/x402-stacks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                x402-stacks
              </a>{" "}
              SDK to call skills programmatically from Node.js, Python, or any
              HTTP client.
            </p>

            <div>
              <h3 className="font-semibold mb-2">Install</h3>
              <CodeBlock code={`npm install x402-stacks axios`} lang="bash" />
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Automated Payment Client (Node.js)
              </h3>
              <CodeBlock
                code={`import { createPaymentClient, privateKeyToAccount } from "x402-stacks";

const account = privateKeyToAccount(process.env.STX_PRIVATE_KEY!, "testnet");
const api = createPaymentClient(account, {
  baseURL: "https://x402skills.com",
});

// x402 payment is handled automatically
const { data } = await api.get("/api/skills/whale-tracker");
console.log(data);
// → { whale_moves: [...], total_volume: "2500000", count: 5 }`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Server-Side Middleware</h3>
              <CodeBlock
                code={`import { paymentMiddleware } from "x402-stacks";

// In your Next.js API route:
export async function GET(req: Request) {
  // This returns 402 if no valid payment, or continues if paid
  const payment = await paymentMiddleware(req, {
    amount: "100000",          // 0.1 STX in microSTX
    payTo: process.env.SERVER_ADDRESS!,
    network: "testnet",
    facilitatorUrl: process.env.FACILITATOR_URL!,
    description: "Whale Tracker skill execution",
  });

  // If we reach here, payment was verified & settled
  const result = await runWhaleTracker();
  return Response.json(result);
}`}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── AI Agent Integration ───────────────────────── */}
        <section>
          <SectionAnchor id="ai-agents">
            <Zap className="h-5 w-5 text-primary" />
            AI Agent Integration
          </SectionAnchor>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              AI agents can discover, pay for, and execute skills fully
              autonomously. The x402 protocol is designed for machine-to-machine
              payments.
            </p>

            <div>
              <h3 className="font-semibold mb-2">Agent Flow</h3>
              <CodeBlock
                code={`import { createPaymentClient, privateKeyToAccount } from "x402-stacks";

// Agent has its own funded wallet
const agent = privateKeyToAccount(AGENT_PRIVATE_KEY, "testnet");
const api = createPaymentClient(agent, {
  baseURL: "https://x402skills.com",
});

// 1. Discover available skills
const { data: registry } = await api.get("/api/registry/skills");

// 2. Pick the best skill for the task
const skill = registry.skills.find(s => s.id === "content-craft");

// 3. Execute with automatic payment
const { data: result } = await api.post(\`/api/skills/\${skill.id}\`, {
  text: "Rewrite this paragraph for clarity...",
  tone: "professional",
  maxLength: 500,
});

// 4. Use the result
console.log(result.rewritten);`}
              />
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm">
                  <strong>Key advantage:</strong> No API keys, no OAuth, no
                  rate-limit negotiations. The agent just pays per call with STX
                  — the protocol handles auth via payment proof.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── Resources ──────────────────────────────────── */}
        <section>
          <SectionAnchor id="resources">
            <ExternalLink className="h-5 w-5 text-primary" />
            Resources &amp; Links
          </SectionAnchor>
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  label: "x402 Protocol Spec",
                  href: "https://www.x402.org",
                  desc: "The HTTP 402 payment protocol specification",
                },
                {
                  label: "x402-stacks SDK",
                  href: "https://github.com/tony1908/x402Stacks",
                  desc: "TypeScript SDK for x402 on Stacks",
                },
                {
                  label: "x402-stacks on npm",
                  href: "https://www.npmjs.com/package/x402-stacks",
                  desc: "npm package for server & client integration",
                },
                {
                  label: "Stacks Documentation",
                  href: "https://docs.stacks.co",
                  desc: "Official Stacks blockchain documentation",
                },
                {
                  label: "Hiro API Reference",
                  href: "https://docs.hiro.so/stacks/api",
                  desc: "Stacks blockchain API by Hiro",
                },
                {
                  label: "Testnet Faucet",
                  href: "https://explorer.hiro.so/sandbox/faucet?chain=testnet",
                  desc: "Get free testnet STX for development",
                },
                {
                  label: "Stacks Explorer",
                  href: "https://explorer.hiro.so",
                  desc: "View transactions and blocks",
                },
                {
                  label: "Facilitator Service",
                  href: "https://facilitator.stacksx402.com",
                  desc: "Atomic settlement facilitator for x402",
                },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:border-primary/30 hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-[#F7931A]/5 p-8 text-center">
          <h2 className="text-xl font-bold">Ready to build?</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Start using skills from the marketplace, or integrate them into your
            app with the SDK.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Skills
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/tony1908/x402Stacks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              View SDK on GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
