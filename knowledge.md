If you’ve ever shipped an API and wished you could charge per request without building a whole billing system… this is for you.
In this tutorial, you’ll create a payment-protected Echo API that charges 0.01 STX per request using the HTTP 402 Payment Required flow, powered by x402-stacks.
What you’ll build
A simple endpoint:
POST /api/echo
Returns your message back
Requires payment: 0.01 STX
Fully automatic: the client pays, facilitator settles, server responds
Prerequisites
Claude Code installed
Node.js 18+
Step 1: Install the x402 stacks skill (Claude Code)
bash
npx skills add x402Stacks/x402stacks-skill --skill x402-stacks -a claude-code
Step 2: Create the project
bash
mkdir echo-api && cd echo-api
npm init -y
npm i express cors dotenv x402-stacks
npm i -D typescript ts-node @types/express @types/cors @types/node
Create tsconfig.json:
javascript
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
Step 3: Ask Claude Code to generate the paid API
Launch Claude Code:
bash
claude
Paste this prompt:
using the x402 stacks skill, create a  echo api protected with x402,
I want to get paid on stx and charge .01 stx per request
Claude should generate:
src/server.ts — Express server
src/routes.ts — Echo route with x402 payment protection
Create .env:
PORT=3000
SERVER_ADDRESS=<your-server-address>
NETWORK=testnet
FACILITATOR_URL=https://facilitator.stacksx402.com
Step 4: Start the server
bash
npm pkg set scripts.dev="ts-node src/server.ts"
npm run dev
Your paid API is live locally.
Resources
Skill repo: https://github.com/x402Stacks/x402stacks-skill
SDK: https://www.npmjs.com/package/x402-stacks
Faucet: https://explorer.stacks.co/sandbox/faucet?chain=testnet
Registry: https://scan.stacksx402.com
