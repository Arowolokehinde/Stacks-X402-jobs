Based on the URL and the project files, you are building x402.jobs (also referred to as x402-stacksJobs), a decentralized marketplace and platform for monetized API endpoints (called "skills" or "resources").

Here is a breakdown of the project:

Core Concept
Pay-Per-Request APIs: You are creating a system where API endpoints are protected by the HTTP 402 Payment Required status code.
Crypto Payments: Accessing these APIs requires immediate micropayments in STX (Stacks) or sBTC (Bitcoin on Stacks).
Machine-to-Machine Economy: The platform is designed for AI Agents and automated workflows to autonomously discover, pay for, and execute these "skills" without human intervention (no subscriptions or API keys).
Key Components
x402-stacks Protocol: A TypeScript library you are using/building that implements the payment flow using a Facilitator Pattern. This ensures payments are atomic—users only get the data if the payment succeeds.
Skills Registry: A marketplace where developers can list their tools (e.g., "Whale Tracker", "AI Content Rewriter") with a specific price tag (e.g., 0.1 STX).
Workflows: The "jobs" aspect involves chaining these individual X402 resources together to create automated, complex workflows.
Tech Stack
Blockchain: Stacks (Layer 2 for Bitcoin).
Web Framework: Next.js (React).
Backend: Node.js/Express with x402-stacks middleware.
In short, you are building the "Gig Economy for AI Agents", where software pays software to get work done using Bitcoin-secured money.