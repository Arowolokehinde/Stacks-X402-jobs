# x402 Protocol on Stacks - Complete Technical Reference

**Source Repository:** https://github.com/tony1908/x402Stacks
**Documentation:** https://docs.x402stacks.xyz
**For Project:** x402-stacksJobs

---

## 1. Overview

x402-stacks is a TypeScript library that implements the HTTP 402 Payment Required protocol on Stacks blockchain. It enables automatic HTTP-level payments for APIs and digital services using **STX** or **sBTC** tokens.

### Core Value Proposition
- **Pay-as-you-go model** - No subscriptions, no API keys, no accounts
- **Machine-to-machine payments** - AI agents can pay autonomously
- **Bitcoin-secured** - Leverages Stacks' connection to Bitcoin
- **Micropayments** - Transactions as small as $0.001

---

## 2. Supported Tokens

| Token | Description | Use Case |
|-------|-------------|----------|
| **STX** | Native Stacks token | General payments, stacking rewards |
| **sBTC** | Bitcoin-backed token | High-value transactions, Bitcoin holders |
| **USDCx** | Stablecoin on Stacks | Price stability, fiat compatibility |

---

## 3. The Facilitator Pattern (Core Architecture)

The x402 protocol uses a **facilitator pattern** for reliable, atomic payments:

```
┌─────────┐         ┌─────────┐         ┌─────────────┐         ┌─────────┐
│  Client │         │  Server │         │ Facilitator │         │  Stacks │
└────┬────┘         └────┬────┘         └──────┬──────┘         └────┬────┘
     │                   │                     │                     │
     │  1. GET /api/x    │                     │                     │
     │──────────────────>│                     │                     │
     │                   │                     │                     │
     │  2. HTTP 402      │                     │                     │
     │  + payment-required header              │                     │
     │<──────────────────│                     │                     │
     │                   │                     │                     │
     │  3. Sign tx       │                     │                     │
     │  (NOT broadcast)  │                     │                     │
     │                   │                     │                     │
     │  4. Retry + payment-signature header    │                     │
     │──────────────────>│                     │                     │
     │                   │                     │                     │
     │                   │  5. POST /settle    │                     │
     │                   │  + signed tx        │                     │
     │                   │────────────────────>│                     │
     │                   │                     │                     │
     │                   │                     │  6. Broadcast tx    │
     │                   │                     │────────────────────>│
     │                   │                     │                     │
     │                   │                     │  7. Confirmation    │
     │                   │                     │<────────────────────│
     │                   │                     │                     │
     │                   │  8. Settlement OK   │                     │
     │                   │<────────────────────│                     │
     │                   │                     │                     │
     │  9. HTTP 200      │                     │                     │
     │  + payment-response header              │                     │
     │  + Response data  │                     │                     │
     │<──────────────────│                     │                     │
     │                   │                     │                     │
```

### Why Facilitator Pattern?

1. **Atomicity** - Payment and access are atomic; no payment = no access
2. **No double-spending** - Client signs but doesn't broadcast
3. **Server control** - Server decides when to broadcast
4. **Centralized confirmation** - Facilitator handles blockchain polling

---

## 4. Protocol Headers

### 4.1 HTTP 402 Response (Server → Client)

When payment is required, server responds with:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
payment-required: <base64-encoded-json>
```

**Decoded `payment-required` header:**

```json
{
  "x402Version": 2,
  "paymentRequirements": {
    "network": "stacks:1",
    "amount": "100000",
    "asset": {
      "type": "native",
      "symbol": "STX"
    },
    "payTo": "SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "scheme": "x402-stacks",
    "maxTimeoutSeconds": 300,
    "resource": "/api/premium",
    "description": "Premium API access"
  }
}
```

### 4.2 Payment Retry Request (Client → Server)

```http
GET /api/premium HTTP/1.1
payment-signature: <base64-encoded-signed-transaction>
```

The client signs the STX/sBTC transaction but does **NOT** broadcast it.

### 4.3 Success Response (Server → Client)

```http
HTTP/1.1 200 OK
Content-Type: application/json
payment-response: <base64-encoded-settlement-confirmation>
```

**Decoded `payment-response` header:**

```json
{
  "transactionHash": "0x1234567890abcdef...",
  "payer": "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "network": "stacks:1"
}
```

---

## 5. Network Identifiers (CAIP-2 Format)

x402 uses CAIP-2 standard for network identification:

| Network | CAIP-2 Identifier |
|---------|-------------------|
| Stacks Mainnet | `stacks:1` |
| Stacks Testnet | `stacks:2147483648` |

---

## 6. Installation

```bash
npm install x402-stacks
```

---

## 7. Client-Side Implementation

### 7.1 Create Payment Client

```typescript
import {
  createPaymentClient,
  privateKeyToAccount
} from 'x402-stacks';

// Convert private key to account
const account = privateKeyToAccount(
  process.env.STACKS_PRIVATE_KEY!,
  'mainnet' // or 'testnet'
);

// Create axios client with automatic 402 handling
const api = createPaymentClient(account, {
  baseURL: 'https://api.x402-stacksjobs.com'
});

// Make requests - payments handled automatically!
const response = await api.get('/api/skills/whale-tracker');
console.log(response.data);
```

### 7.2 Wrap Existing Axios Instance

```typescript
import axios from 'axios';
import { wrapAxiosWithPayment, privateKeyToAccount } from 'x402-stacks';

const account = privateKeyToAccount(process.env.PRIVATE_KEY!, 'mainnet');
const axiosInstance = axios.create({ baseURL: 'https://api.example.com' });

// Wrap with payment handling
const paymentClient = wrapAxiosWithPayment(axiosInstance, account);

// Automatic 402 handling
const result = await paymentClient.get('/premium-endpoint');
```

### 7.3 Decode Payment Response

```typescript
import { decodePaymentResponse } from 'x402-stacks';

const response = await api.get('/api/premium');
const paymentInfo = decodePaymentResponse(
  response.headers['payment-response']
);

console.log('Transaction:', paymentInfo.transactionHash);
console.log('Payer:', paymentInfo.payer);
```

---

## 8. Server-Side Implementation

### 8.1 Express Middleware

```typescript
import express from 'express';
import {
  paymentMiddleware,
  STXtoMicroSTX,
  getPayment
} from 'x402-stacks';

const app = express();

// Basic payment-protected endpoint
app.get('/api/skills/whale-tracker',
  paymentMiddleware({
    amount: STXtoMicroSTX(0.1),  // 0.1 STX = 100000 microSTX
    address: 'SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    network: 'mainnet',
    facilitatorUrl: 'https://facilitator.x402stacks.com'
  }),
  async (req, res) => {
    // Get payment info from verified request
    const payment = getPayment(req);
    console.log('Paid by:', payment.payer);
    console.log('Transaction:', payment.transaction);

    // Execute skill logic
    const result = await executeWhaleTracker(req.query);
    res.json(result);
  }
);

app.listen(3000);
```

### 8.2 Middleware Configuration Options

```typescript
interface PaymentMiddlewareConfig {
  // Required
  amount: string | bigint;           // Amount in microSTX or sats
  address: string;                   // Recipient Stacks address
  network: 'mainnet' | 'testnet';    // Network

  // Optional
  facilitatorUrl?: string;           // Facilitator API endpoint
  tokenType?: 'STX' | 'sBTC';        // Token type (default: STX)
  resource?: string;                 // Resource identifier
  description?: string;              // Human-readable description
  mimeType?: string;                 // Response MIME type
  tokenContract?: string;            // sBTC contract address
  maxTimeoutSeconds?: number;        // Max wait time (default: 300)
}
```

### 8.3 sBTC Payment Example

```typescript
import { paymentMiddleware, BTCtoSats, getDefaultSBTCContract } from 'x402-stacks';

app.get('/api/premium-btc',
  paymentMiddleware({
    amount: BTCtoSats(0.0001),  // 0.0001 BTC = 10000 sats
    address: 'SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    network: 'mainnet',
    tokenType: 'sBTC',
    tokenContract: getDefaultSBTCContract('mainnet')
  }),
  (req, res) => {
    res.json({ data: 'Premium Bitcoin-secured content' });
  }
);
```

### 8.4 Manual Payment Verification

```typescript
import { X402PaymentVerifier, createVerifier } from 'x402-stacks';

// Create verifier
const verifier = createVerifier(
  'https://facilitator.x402stacks.com',
  'mainnet'
);

// Verify payment manually
async function verifyPayment(signedTx: string): Promise<boolean> {
  try {
    const result = await verifier.settle(signedTx);
    return result.success;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}
```

---

## 9. Utility Functions

### 9.1 Amount Conversions

```typescript
import {
  STXtoMicroSTX,
  microSTXtoSTX,
  BTCtoSats,
  satsToBTC
} from 'x402-stacks';

// STX conversions
const microSTX = STXtoMicroSTX(1.5);      // 1500000n
const stx = microSTXtoSTX(1500000n);      // 1.5

// BTC/sBTC conversions
const sats = BTCtoSats(0.001);            // 100000n
const btc = satsToBTC(100000n);           // 0.001
```

### 9.2 Address Validation

```typescript
import { isValidStacksAddress } from 'x402-stacks';

isValidStacksAddress('SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'); // true
isValidStacksAddress('invalid');                                    // false
```

### 9.3 Network Utilities

```typescript
import {
  networkToCAIP2,
  caip2ToNetwork,
  getExplorerURL
} from 'x402-stacks';

// Network to CAIP-2
networkToCAIP2('mainnet');  // 'stacks:1'
networkToCAIP2('testnet');  // 'stacks:2147483648'

// CAIP-2 to network
caip2ToNetwork('stacks:1');           // 'mainnet'
caip2ToNetwork('stacks:2147483648');  // 'testnet'

// Explorer URL
getExplorerURL('0x123...', 'mainnet');
// 'https://explorer.hiro.so/txid/0x123...?chain=mainnet'
```

### 9.4 Key Generation

```typescript
import { generateKeypair } from 'x402-stacks';

const { privateKey, address } = generateKeypair('mainnet');
console.log('Address:', address);
console.log('Private Key:', privateKey);
```

### 9.5 Format Payment Amount

```typescript
import { formatPaymentAmount } from 'x402-stacks';

formatPaymentAmount(100000n, { token: 'STX' });   // '0.1 STX'
formatPaymentAmount(10000n, { token: 'sBTC' });   // '0.0001 sBTC'
```

---

## 10. Complete Skill API Example

### 10.1 Server Implementation

```typescript
// /api/skills/[skillId]/route.ts
import express from 'express';
import {
  paymentMiddleware,
  STXtoMicroSTX,
  getPayment
} from 'x402-stacks';

const app = express();

// Skill registry with pricing
const SKILLS = {
  'whale-tracker': {
    name: 'Stacks Whale Tracker',
    price: STXtoMicroSTX(0.1),  // 0.1 STX
    execute: async (input: any) => {
      // Fetch whale transactions from Stacks API
      const whales = await fetchWhaleTransactions(input);
      return whales;
    }
  },
  'content-craft': {
    name: 'AI Content Rewriter',
    price: STXtoMicroSTX(0.25),  // 0.25 STX
    execute: async (input: any) => {
      // Call OpenAI for content rewriting
      const rewritten = await rewriteContent(input);
      return rewritten;
    }
  }
};

// Dynamic skill endpoint
app.get('/api/skills/:skillId', (req, res, next) => {
  const skill = SKILLS[req.params.skillId];

  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  // Apply payment middleware dynamically
  paymentMiddleware({
    amount: skill.price,
    address: process.env.TREASURY_ADDRESS!,
    network: 'mainnet',
    resource: `/api/skills/${req.params.skillId}`,
    description: skill.name
  })(req, res, next);
}, async (req, res) => {
  const skill = SKILLS[req.params.skillId];
  const payment = getPayment(req);

  try {
    // Log execution
    await logExecution({
      skillId: req.params.skillId,
      txId: payment.transaction,
      payer: payment.payer,
      input: req.query
    });

    // Execute skill
    const result = await skill.execute(req.query);

    res.json({
      success: true,
      data: result,
      payment: {
        transaction: payment.transaction,
        amount: skill.price.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 10.2 Client Implementation

```typescript
// AI Agent Example
import { createPaymentClient, privateKeyToAccount } from 'x402-stacks';

class SkillsAgent {
  private client;
  private budget: number;

  constructor(privateKey: string, budgetSTX: number) {
    const account = privateKeyToAccount(privateKey, 'mainnet');
    this.client = createPaymentClient(account, {
      baseURL: 'https://api.x402-stacksjobs.com'
    });
    this.budget = budgetSTX;
  }

  async executeSkill(skillId: string, input: Record<string, any>) {
    try {
      const response = await this.client.get(`/api/skills/${skillId}`, {
        params: input
      });

      // Deduct from budget
      const amountPaid = parseFloat(response.data.payment.amount) / 1e6;
      this.budget -= amountPaid;

      console.log(`Executed ${skillId}, paid ${amountPaid} STX`);
      console.log(`Remaining budget: ${this.budget} STX`);

      return response.data;
    } catch (error) {
      console.error(`Skill execution failed:`, error);
      throw error;
    }
  }
}

// Usage
const agent = new SkillsAgent(process.env.AGENT_PRIVATE_KEY!, 10);

const whales = await agent.executeSkill('whale-tracker', {
  timeframe: '24h',
  minAmount: 100000
});

console.log('Whale moves:', whales.data.whale_moves);
```

---

## 11. Security Considerations

### 11.1 Key Security Points

1. **Clients sign but don't broadcast** - Prevents unauthorized spending
2. **Server controls broadcast** - Via facilitator pattern
3. **CAIP-2 identifiers** - Prevent cross-chain replay attacks
4. **Base64 encoding** - Safe HTTP header transmission
5. **Transaction timeout** - Prevents stale transaction reuse

### 11.2 Best Practices

```typescript
// 1. Never expose private keys
const privateKey = process.env.STACKS_PRIVATE_KEY!; // Use env vars

// 2. Validate addresses
import { isValidStacksAddress } from 'x402-stacks';
if (!isValidStacksAddress(recipientAddress)) {
  throw new Error('Invalid recipient address');
}

// 3. Set reasonable timeouts
paymentMiddleware({
  // ...
  maxTimeoutSeconds: 300  // 5 minutes max
});

// 4. Log all transactions
await db.logTransaction({
  txId: payment.transaction,
  payer: payment.payer,
  amount: skill.price,
  timestamp: Date.now()
});
```

---

## 12. Error Handling

```typescript
import { X402Error } from 'x402-stacks';

try {
  const response = await client.get('/api/premium');
} catch (error) {
  if (error instanceof X402Error) {
    switch (error.code) {
      case 'INSUFFICIENT_BALANCE':
        console.error('Not enough STX to pay');
        break;
      case 'PAYMENT_TIMEOUT':
        console.error('Transaction confirmation timed out');
        break;
      case 'INVALID_SIGNATURE':
        console.error('Transaction signature invalid');
        break;
      case 'NETWORK_MISMATCH':
        console.error('Wrong network');
        break;
      default:
        console.error('Payment error:', error.message);
    }
  }
}
```

---

## 13. Testing

### 13.1 Testnet Setup

```typescript
// Use testnet for development
const account = privateKeyToAccount(
  process.env.TESTNET_PRIVATE_KEY!,
  'testnet'
);

const client = createPaymentClient(account, {
  baseURL: 'https://testnet-api.x402-stacksjobs.com'
});
```

### 13.2 Get Testnet STX

- Stacks Testnet Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet

---

## 14. Resources

### Official Links
- **x402-stacks GitHub:** https://github.com/tony1908/x402Stacks
- **x402 Protocol:** https://www.x402.org
- **Stacks Documentation:** https://docs.stacks.co
- **Hiro API:** https://docs.hiro.so

### API Endpoints
- **Stacks Mainnet API:** https://api.mainnet.hiro.so
- **Stacks Testnet API:** https://api.testnet.hiro.so
- **Stacks Explorer:** https://explorer.hiro.so

---

## 15. Summary for x402-stacksJobs

For the **x402-stacksJobs** marketplace, the integration pattern is:

1. **Install:** `npm install x402-stacks`
2. **Server:** Use `paymentMiddleware()` on each skill endpoint
3. **Client:** Use `createPaymentClient()` for automatic 402 handling
4. **Tokens:** Support STX (primary) and sBTC (optional)
5. **Network:** Start on testnet, deploy to mainnet
6. **Facilitator:** Use the x402stacks facilitator or run your own

This enables the core x402-stacksJobs value proposition:
- **Humans** → Connect wallet → Pay STX → Get skill result
- **AI Agents** → Auto-discover skills → Auto-pay → Process results

---

*Document compiled from https://github.com/tony1908/x402Stacks*
