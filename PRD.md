# Stacks Skills Marketplace - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** February 10, 2026  
**Project Duration:** 7 days (Feb 9-16, 2026)  
**Target:** x402 Stacks Challenge Hackathon

---

## 1. Executive Summary

### 1.1 Product Overview
Stacks Skills Marketplace is a decentralized marketplace for pay-per-use AI services (called "skills") using the x402 payment protocol on Stacks blockchain. Users and AI agents can discover, pay for, and execute automated tasks without subscriptions, API keys, or accounts.

### 1.2 Core Value Proposition
- **For Consumers:** Discover and pay for AI services on-demand with STX micropayments
- **For Skill Creators:** Monetize APIs and automation without building payment infrastructure
- **For AI Agents:** Autonomously discover and pay for services programmatically

### 1.3 Inspiration
Inspired by x402.jobs on Solana, this project brings the same pay-per-use automation marketplace to Stacks, leveraging Bitcoin's security through Stacks settlement.

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### **Blockchain Layer**
- **Blockchain:** Stacks Mainnet
- **Payment Token:** STX (Stacks native token)
- **Optional:** sBTC for Bitcoin-native payments
- **Smart Contracts:** Optional Clarity contracts for payment escrow (v2 feature)

#### **Backend**
- **Language:** TypeScript/Node.js
- **Framework:** Express.js or Next.js API routes
- **Stacks Integration:** @stacks/transactions, @stacks/blockchain-api-client
- **Database:** PostgreSQL (for skill registry, payment logs, usage stats)
- **Caching:** Redis (for payment verification caching)

#### **Frontend**
- **Framework:** Next.js 16 (React 19)
- **Styling:** TailwindCSS
- **Wallet Integration:** Stacks.js Connect, Hiro Wallet, Leather Wallet
- **State Management:** React Context + hooks

#### **Infrastructure**
- **Hosting:** Vercel (frontend + API routes)
- **Database:** Supabase or Railway (PostgreSQL)
- **Monitoring:** Sentry (errors), PostHog (analytics)

---

### 2.2 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Browser    │         │  AI Agent    │                 │
│  │   (Human)    │         │  (Auto)      │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                        │                          │
│         └────────────┬───────────┘                          │
│                      │                                      │
│                      ▼                                      │
│         ┌────────────────────────┐                         │
│         │  Marketplace Frontend  │                         │
│         │  - Browse Skills       │                         │
│         │  - View Pricing        │                         │
│         │  - Try Demo            │                         │
│         └───────────┬────────────┘                         │
│                     │                                      │
│                     ▼                                      │
│         ┌────────────────────────┐                         │
│         │   Skill API Gateway    │                         │
│         │   - x402 Handler       │                         │
│         │   - Payment Verify     │                         │
│         │   - Routing            │                         │
│         └───────────┬────────────┘                         │
│                     │                                      │
│         ┌───────────┴────────────┐                         │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌─────────────┐        ┌─────────────┐                   │
│  │ Skill APIs  │        │   Stacks    │                   │
│  │ (5 Skills)  │◄───────┤ Blockchain  │                   │
│  │             │ verify │  (Payment)  │                   │
│  └─────────────┘        └─────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features

### 3.1 x402 Payment Protocol Implementation

#### **3.1.1 HTTP 402 Flow**

**Standard Flow:**
```
1. Client → GET /api/skill/{skill-id}
2. Server → HTTP 402 Payment Required
   Headers:
     X-Payment-Required: true
   Body:
     {
       "error": "Payment Required",
       "payment": {
         "amount": "100000",        // microSTX (0.1 STX)
         "currency": "STX",
         "network": "stacks-mainnet",
         "recipient": "SP2X...",
         "memo": "skill:whale-tracker:exec-123",
         "resource": "/api/skill/whale-tracker"
       }
     }

3. Client → Signs & Broadcasts STX Transaction
4. Client → GET /api/skill/{skill-id}
   Headers:
     X-Payment-Proof: {transaction-id}
5. Server → Verifies tx on Stacks blockchain
6. Server → HTTP 200 OK + Skill Result
```

#### **3.1.2 Payment Verification Logic**

```typescript
async function verifyPayment(
  txId: string, 
  expectedAmount: number,
  expectedRecipient: string,
  expectedMemo: string
): Promise<boolean> {
  
  // 1. Fetch transaction from Stacks API
  const tx = await stacksApi.getTransaction(txId);
  
  // 2. Verify transaction status
  if (tx.tx_status !== 'success') {
    return false;
  }
  
  // 3. Verify transaction type (STX transfer)
  if (tx.tx_type !== 'token_transfer') {
    return false;
  }
  
  // 4. Verify amount
  if (parseInt(tx.token_transfer.amount) < expectedAmount) {
    return false;
  }
  
  // 5. Verify recipient
  if (tx.token_transfer.recipient_address !== expectedRecipient) {
    return false;
  }
  
  // 6. Verify memo (optional but recommended)
  if (tx.token_transfer.memo && !tx.token_transfer.memo.includes(expectedMemo)) {
    return false;
  }
  
  // 7. Check transaction age (prevent replay attacks)
  const txAge = Date.now() - tx.burn_block_time * 1000;
  if (txAge > 3600000) { // 1 hour
    return false;
  }
  
  // 8. Check if transaction already used (prevent double-spend)
  const alreadyUsed = await db.checkTransactionUsed(txId);
  if (alreadyUsed) {
    return false;
  }
  
  // 9. Mark transaction as used
  await db.markTransactionUsed(txId);
  
  return true;
}
```

---

### 3.2 Skills Marketplace Frontend

#### **3.2.1 Pages**

**Homepage (`/`)**
- Hero section explaining the concept
- Featured skills (top 3 by usage)
- Categories section
- Stats: Total skills, total executions, total STX paid
- CTA: "Browse Skills" or "Create Your Skill"

**Skills Directory (`/skills`)**
- Grid/list view of all available skills
- Filters: Category, Price range, Popularity
- Sort: Newest, Most used, Lowest price
- Search bar
- Each skill card shows:
  - Skill name
  - Brief description (1 line)
  - Price per execution
  - Success rate %
  - Number of executions

**Skill Detail Page (`/skills/{skill-id}`)**
- Skill name and full description
- Creator information
- Pricing: Per-execution cost
- API documentation:
  - Endpoint URL
  - Input schema (JSON)
  - Output schema (JSON)
  - Example request/response
- Live demo section:
  - Input form
  - "Try Demo" button (pay small amount)
  - Result display
- Usage stats:
  - Total executions
  - Success rate
  - Average response time
- Reviews/ratings (future feature)
- Integration guide (code snippets)

**Create Skill Page (`/create`)** *(Stretch Goal)*
- Form to register new skill:
  - Skill name
  - Description
  - API endpoint URL
  - Pricing (STX per execution)
  - Input/output schema
  - Example request/response
- Validation: Test endpoint before publishing
- Payment destination address
- Publish to marketplace

**Documentation (`/docs`)**
- Getting Started guide
- x402 Protocol explanation
- Integration guide for developers
- Skill creation guide
- API reference
- FAQs

---

#### **3.2.2 Wallet Integration**

**Supported Wallets:**
- Hiro Wallet (primary)
- Leather Wallet
- Xverse Wallet

**Wallet Connection Flow:**
```
1. User clicks "Connect Wallet"
2. Modal shows wallet options
3. User selects wallet (e.g., Hiro)
4. Wallet extension prompts for approval
5. App receives wallet address
6. Display address in navbar (truncated)
7. Enable "Try Demo" and payment features
```

**Payment Flow:**
```
1. User clicks "Execute Skill" or "Try Demo"
2. App constructs STX transfer transaction:
   {
     amount: 100000,  // microSTX
     recipient: "SP2X...",
     memo: "skill:whale-tracker:exec-abc123"
   }
3. App calls wallet.signTransaction()
4. Wallet shows confirmation popup to user
5. User approves transaction
6. Wallet broadcasts to Stacks network
7. App receives transaction ID
8. App polls for confirmation (or uses websocket)
9. Once confirmed, app retries skill API with tx ID
10. Skill executes, result displayed to user
```

---

### 3.3 Skill API Specifications

Each skill follows this standard pattern:

#### **3.3.1 Skill API Endpoint Template**

```typescript
// /api/skills/{skill-id}
export async function GET(request: Request) {
  
  // Extract payment proof from headers
  const paymentTxId = request.headers.get('X-Payment-Proof');
  
  // Parse query parameters (skill input)
  const url = new URL(request.url);
  const input = Object.fromEntries(url.searchParams);
  
  // Check if payment provided
  if (!paymentTxId) {
    // No payment - return 402
    return new Response(
      JSON.stringify({
        error: 'Payment Required',
        payment: {
          amount: '100000',  // 0.1 STX
          currency: 'STX',
          network: 'stacks-mainnet',
          recipient: process.env.TREASURY_ADDRESS,
          memo: `skill:${skillId}:${generateExecutionId()}`,
          resource: `/api/skills/${skillId}`
        }
      }),
      { 
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Required': 'true'
        }
      }
    );
  }
  
  // Verify payment
  const isValidPayment = await verifyPayment(
    paymentTxId,
    100000,  // expected amount
    process.env.TREASURY_ADDRESS,
    `skill:${skillId}`
  );
  
  if (!isValidPayment) {
    return new Response(
      JSON.stringify({ error: 'Invalid payment' }),
      { status: 402 }
    );
  }
  
  // Log execution
  await db.logSkillExecution({
    skillId,
    txId: paymentTxId,
    input,
    timestamp: Date.now()
  });
  
  // Execute skill logic
  try {
    const result = await executeSkillLogic(input);
    
    // Return result
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Execution-Id': generateExecutionId(),
          'X-Payment-Confirmed': paymentTxId
        }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
```

---

#### **3.3.2 The 5 Launch Skills**

---

**Skill 1: Whale Tracker**

```yaml
ID: whale-tracker
Name: Stacks Whale Tracker
Description: Real-time monitoring of large STX transactions
Category: Analytics
Price: 0.1 STX per query
Endpoint: /api/skills/whale-tracker
```

**Input Schema:**
```json
{
  "timeframe": "24h | 7d | 30d",
  "minAmount": 100000,  // optional, default 100k STX
  "limit": 50  // optional, max results
}
```

**Output Schema:**
```json
{
  "whale_moves": [
    {
      "tx_id": "0xabc...",
      "amount": "500000",
      "from": "SP2X...",
      "to": "SP3Y...",
      "timestamp": 1707580800,
      "block_height": 150000,
      "memo": "..."
    }
  ],
  "total_volume": "2500000",
  "count": 5,
  "timeframe": "24h"
}
```

**Implementation:**
```typescript
async function executeWhaleTracker(input: any) {
  const { timeframe = '24h', minAmount = 100000, limit = 50 } = input;
  
  // Calculate time range
  const now = Date.now();
  const timeRanges = {
    '24h': now - 86400000,
    '7d': now - 604800000,
    '30d': now - 2592000000
  };
  const startTime = timeRanges[timeframe];
  
  // Query Stacks API for large transactions
  const transactions = await stacksApi.getTransactions({
    type: 'token_transfer',
    minAmount,
    startTime,
    limit
  });
  
  // Filter and format
  const whaleMoves = transactions
    .filter(tx => parseInt(tx.token_transfer.amount) >= minAmount)
    .map(tx => ({
      tx_id: tx.tx_id,
      amount: tx.token_transfer.amount,
      from: tx.sender_address,
      to: tx.token_transfer.recipient_address,
      timestamp: tx.burn_block_time,
      block_height: tx.block_height,
      memo: tx.token_transfer.memo || ''
    }));
  
  const totalVolume = whaleMoves.reduce(
    (sum, tx) => sum + parseInt(tx.amount), 
    0
  );
  
  return {
    whale_moves: whaleMoves,
    total_volume: totalVolume.toString(),
    count: whaleMoves.length,
    timeframe
  };
}
```

---

**Skill 2: Content Craft**

```yaml
ID: content-craft
Name: AI Content Rewriter
Description: Professional content rewriting using AI
Category: Content
Price: 0.25 STX per rewrite
Endpoint: /api/skills/content-craft
```

**Input Schema:**
```json
{
  "text": "Your content here...",
  "tone": "professional | casual | technical",  // optional
  "max_length": 500  // optional
}
```

**Output Schema:**
```json
{
  "original": "Your content here...",
  "rewritten": "Professionally rewritten version...",
  "tone": "professional",
  "word_count": 85,
  "changes_summary": "Improved clarity and professionalism"
}
```

**Implementation:**
```typescript
async function executeContentCraft(input: any) {
  const { text, tone = 'professional', max_length = 1000 } = input;
  
  // Validate input
  if (!text || text.length < 10) {
    throw new Error('Text must be at least 10 characters');
  }
  
  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a professional content writer. Rewrite the following text in a ${tone} tone. Keep it under ${max_length} words.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    max_tokens: 500
  });
  
  const rewritten = response.choices[0].message.content;
  
  return {
    original: text,
    rewritten,
    tone,
    word_count: rewritten.split(' ').length,
    changes_summary: 'Improved clarity and professionalism'
  };
}
```

---

**Skill 3: Stacks Scout**

```yaml
ID: stacks-scout
Name: On-Chain Analytics
Description: Real-time Stacks blockchain metrics
Category: Analytics
Price: 0.5 STX per query
Endpoint: /api/skills/stacks-scout
```

**Input Schema:**
```json
{
  "metrics": ["tvl", "active_wallets", "transactions", "block_height"],
  "timeframe": "24h | 7d | 30d"
}
```

**Output Schema:**
```json
{
  "tvl": {
    "value": "45000000",
    "change_24h": "+12.5%"
  },
  "active_wallets": {
    "count": 15000,
    "change_24h": "+8.2%"
  },
  "transactions": {
    "count": 50000,
    "volume": "2500000 STX"
  },
  "block_height": 150000,
  "timestamp": 1707580800
}
```

**Implementation:**
```typescript
async function executeStacksScout(input: any) {
  const { metrics = ['tvl', 'active_wallets'], timeframe = '24h' } = input;
  
  const result: any = {};
  
  // Fetch current block height
  if (metrics.includes('block_height')) {
    const info = await stacksApi.getInfo();
    result.block_height = info.stacks_tip_height;
  }
  
  // Fetch TVL (mock - integrate with DeFi protocols)
  if (metrics.includes('tvl')) {
    result.tvl = {
      value: '45000000',
      change_24h: '+12.5%'
    };
  }
  
  // Fetch active wallets
  if (metrics.includes('active_wallets')) {
    const wallets = await getActiveWallets(timeframe);
    result.active_wallets = {
      count: wallets.count,
      change_24h: wallets.change
    };
  }
  
  // Fetch transaction stats
  if (metrics.includes('transactions')) {
    const txStats = await getTransactionStats(timeframe);
    result.transactions = {
      count: txStats.count,
      volume: `${txStats.volume} STX`
    };
  }
  
  result.timestamp = Date.now();
  
  return result;
}
```

---

**Skill 4: Profile Pro**

```yaml
ID: profile-pro
Name: Social Profile Analyzer
Description: AI-powered profile audit with recommendations
Category: Social
Price: 2 STX per audit
Endpoint: /api/skills/profile-pro
```

**Input Schema:**
```json
{
  "profile_url": "https://twitter.com/username",
  "analysis_depth": "basic | detailed"  // optional
}
```

**Output Schema:**
```json
{
  "profile": {
    "username": "stacksdev",
    "platform": "twitter",
    "followers": 5000
  },
  "score": 85,
  "strengths": [
    "Consistent posting schedule",
    "High engagement rate"
  ],
  "weaknesses": [
    "Limited use of hashtags",
    "Could improve bio clarity"
  ],
  "suggestions": [
    "Add 2-3 relevant hashtags per post",
    "Update bio to highlight expertise",
    "Increase posting frequency to 2x/day"
  ],
  "report_url": "https://..."
}
```

**Implementation:**
```typescript
async function executeProfilePro(input: any) {
  const { profile_url, analysis_depth = 'basic' } = input;
  
  // Parse profile URL
  const platform = extractPlatform(profile_url);
  const username = extractUsername(profile_url);
  
  // Scrape profile data (use appropriate API)
  const profileData = await scrapeProfile(platform, username);
  
  // Analyze with AI
  const analysis = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a social media expert. Analyze this profile and provide actionable suggestions.'
      },
      {
        role: 'user',
        content: JSON.stringify(profileData)
      }
    ]
  });
  
  // Parse AI response
  const parsed = parseAnalysis(analysis.choices[0].message.content);
  
  return {
    profile: {
      username,
      platform,
      followers: profileData.followers
    },
    score: parsed.score,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    suggestions: parsed.suggestions,
    report_url: `https://skills.stacks/reports/${generateReportId()}`
  };
}
```

---

**Skill 5: Meme Radar**

```yaml
ID: meme-radar
Name: Crypto Meme Trend Detector
Description: Real-time trending crypto memes and sentiment
Category: Social
Price: 0.1 STX per query
Endpoint: /api/skills/meme-radar
```

**Input Schema:**
```json
{
  "limit": 10,  // optional, default 10
  "category": "all | bitcoin | stacks | defi"  // optional
}
```

**Output Schema:**
```json
{
  "trending_memes": [
    {
      "title": "Number Go Up",
      "description": "Bitcoin price celebration",
      "sentiment": "bullish",
      "popularity_score": 95,
      "sources": ["twitter", "reddit"],
      "first_seen": 1707580800
    }
  ],
  "overall_sentiment": "bullish",
  "trending_hashtags": ["#Bitcoin", "#HODL", "#Stacks"],
  "timestamp": 1707580800
}
```

**Implementation:**
```typescript
async function executeMemeRadar(input: any) {
  const { limit = 10, category = 'all' } = input;
  
  // Scrape Twitter, Reddit for crypto memes
  const twitterMemes = await scrapeTrendingMemes('twitter', category);
  const redditMemes = await scrapeTrendingMemes('reddit', category);
  
  // Combine and rank
  const allMemes = [...twitterMemes, ...redditMemes]
    .sort((a, b) => b.popularity_score - a.popularity_score)
    .slice(0, limit);
  
  // Analyze sentiment
  const sentiments = allMemes.map(m => m.sentiment);
  const bullishCount = sentiments.filter(s => s === 'bullish').length;
  const overall_sentiment = bullishCount > limit / 2 ? 'bullish' : 'bearish';
  
  // Extract trending hashtags
  const hashtags = extractHashtags(allMemes);
  
  return {
    trending_memes: allMemes,
    overall_sentiment,
    trending_hashtags: hashtags.slice(0, 10),
    timestamp: Date.now()
  };
}
```

---

### 3.4 Skill Registry & Discovery

#### **3.4.1 Skill Registry Database Schema**

```sql
CREATE TABLE skills (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  price_microstx BIGINT NOT NULL,
  endpoint_url TEXT NOT NULL,
  creator_address VARCHAR(50) NOT NULL,
  treasury_address VARCHAR(50) NOT NULL,
  
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  example_request JSONB,
  example_response JSONB,
  
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  total_executions INTEGER DEFAULT 0,
  total_revenue_microstx BIGINT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.0,
  avg_response_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_executions (
  id SERIAL PRIMARY KEY,
  skill_id VARCHAR(50) REFERENCES skills(id),
  tx_id VARCHAR(100) UNIQUE NOT NULL,
  
  input JSONB,
  output JSONB,
  
  status VARCHAR(20) NOT NULL,  -- success, failed
  error_message TEXT,
  
  payment_amount_microstx BIGINT NOT NULL,
  response_time_ms INTEGER,
  
  executed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_active ON skills(is_active);
CREATE INDEX idx_executions_skill ON skill_executions(skill_id);
CREATE INDEX idx_executions_tx ON skill_executions(tx_id);
```

---

#### **3.4.2 Skill Registration API** *(Stretch Goal)*

**Endpoint:** `POST /api/registry/create`

**Request Body:**
```json
{
  "skill": {
    "id": "my-custom-skill",
    "name": "My Custom Skill",
    "description": "Does something useful",
    "category": "utilities",
    "price_microstx": 50000,
    "endpoint_url": "https://myapi.com/skill",
    "treasury_address": "SP2X...",
    
    "input_schema": {
      "type": "object",
      "properties": {
        "param1": {"type": "string"}
      }
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "result": {"type": "string"}
      }
    }
  },
  "signature": "..."  // Signed by creator's Stacks wallet
}
```

**Validation Process:**
1. Verify signature matches creator_address
2. Validate skill ID is unique
3. Test endpoint_url is accessible
4. Validate JSON schemas
5. Submit test execution
6. If all pass → Add to registry with `is_verified: false`
7. Manual review → Set `is_verified: true`

---

### 3.5 Client SDK (x402-stacks Library)

#### **3.5.1 JavaScript/TypeScript SDK**

**Installation:**
```bash
npm install x402-stacks
```

**Usage:**
```typescript
import { X402Client } from 'x402-stacks';

// Initialize client with wallet
const client = new X402Client({
  wallet: hiroWallet,  // Hiro/Leather wallet instance
  network: 'mainnet'
});

// Execute skill (auto-handles 402 payment)
const result = await client.executeSkill('whale-tracker', {
  timeframe: '24h',
  minAmount: 100000
});

console.log(result.whale_moves);
```

**Implementation:**
```typescript
export class X402Client {
  private wallet: StacksWallet;
  private network: 'mainnet' | 'testnet';
  
  constructor(config: X402Config) {
    this.wallet = config.wallet;
    this.network = config.network;
  }
  
  async executeSkill(skillId: string, input: any): Promise<any> {
    const skillUrl = `https://api.skills.stacks/skills/${skillId}`;
    
    // 1. Try to fetch without payment (will get 402)
    const response = await fetch(skillUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });
    
    // 2. If 402, handle payment
    if (response.status === 402) {
      const paymentInfo = await response.json();
      
      // 3. Construct STX transaction
      const tx = await makeSTXTokenTransfer({
        recipient: paymentInfo.payment.recipient,
        amount: new BigNum(paymentInfo.payment.amount),
        memo: paymentInfo.payment.memo,
        network: this.getStacksNetwork(),
        anchorMode: AnchorMode.Any,
        senderKey: this.wallet.privateKey
      });
      
      // 4. Broadcast transaction
      const txId = await broadcastTransaction(tx, this.getStacksNetwork());
      
      // 5. Wait for confirmation
      await this.waitForConfirmation(txId);
      
      // 6. Retry request with payment proof
      const response2 = await fetch(skillUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Proof': txId
        },
        body: JSON.stringify(input)
      });
      
      if (!response2.ok) {
        throw new Error(`Skill execution failed: ${response2.statusText}`);
      }
      
      return await response2.json();
    }
    
    // If not 402, return result directly
    return await response.json();
  }
  
  private async waitForConfirmation(txId: string): Promise<void> {
    // Poll Stacks API for transaction confirmation
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      const tx = await this.getTransaction(txId);
      if (tx.tx_status === 'success') {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw new Error('Transaction confirmation timeout');
  }
  
  private getStacksNetwork(): StacksNetwork {
    return this.network === 'mainnet' 
      ? new StacksMainnet() 
      : new StacksTestnet();
  }
}
```

---

## 4. User Flows

### 4.1 Human User Flow (Detailed)

#### **Flow 1: Discover & Execute Skill**

```
1. LANDING
   User → visits https://skills.stacks
   Sees: Hero, Featured skills, Stats
   
2. BROWSE
   User → clicks "Browse Skills"
   Sees: Grid of 5 skills with cards showing:
     - Name
     - Description
     - Price
     - Executions count
   
3. SKILL DETAIL
   User → clicks "Whale Tracker" skill card
   Lands on: /skills/whale-tracker
   Sees:
     - Full description
     - Price: 0.1 STX
     - API documentation
     - Live demo section
     - Example input/output
     - Integration code snippets
   
4. TRY DEMO
   User → clicks "Try Demo" button
   
   IF wallet not connected:
     → "Connect Wallet" modal appears
     → User selects Hiro Wallet
     → Hiro extension prompts approval
     → User approves
     → Wallet address displayed in navbar
   
   → Demo form appears with pre-filled example input:
     {
       "timeframe": "24h",
       "minAmount": 100000,
       "limit": 10
     }
   
5. PAYMENT
   User → clicks "Execute (0.1 STX)"
   
   → Hiro Wallet popup appears:
     "Confirm Transaction
      To: SP2X...treasury
      Amount: 0.1 STX
      Memo: skill:whale-tracker:exec-abc123"
   
   User → clicks "Confirm"
   
   → Wallet broadcasts transaction
   → App shows "Waiting for confirmation..." (15-30 seconds)
   → Transaction confirmed
   
6. EXECUTION
   → App automatically retries API with tx ID in header
   → Skill executes on backend
   → Result appears in demo section:
   
   {
     "whale_moves": [
       {
         "tx_id": "0x123...",
         "amount": "500000",
         "from": "SP2X...",
         "to": "SP3Y...",
         "timestamp": 1707580800
       },
       ...
     ],
     "total_volume": "2500000",
     "count": 5
   }
   
7. POST-EXECUTION
   User sees:
     ✓ Success message
     ✓ Result data (formatted nicely)
     ✓ "Execute Again" button
     ✓ "Integrate This Skill" section with code snippet:
   
   ```javascript
   import { X402Client } from 'x402-stacks';
   
   const client = new X402Client({ wallet });
   const result = await client.executeSkill('whale-tracker', {
     timeframe: '24h'
   });
   ```
   
8. INTEGRATION
   User → copies code snippet
   User → integrates into their app
   User's app → can now call skill programmatically
```

---

#### **Flow 2: Create New Skill** *(Stretch Goal)*

```
1. NAVIGATE
   User → clicks "Create Skill" in navbar
   Lands on: /create
   
2. FORM
   User fills out:
     - Skill Name: "My Weather Skill"
     - Description: "Real-time weather data"
     - Category: dropdown → "Utilities"
     - Price: 0.05 STX
     - API Endpoint: https://myapi.com/weather
     - Treasury Address: SP2X... (auto-filled from wallet)
     
     - Input Schema: JSON editor
       {
         "type": "object",
         "properties": {
           "city": {"type": "string"}
         }
       }
     
     - Output Schema: JSON editor
       {
         "type": "object",
         "properties": {
           "temp": {"type": "number"},
           "condition": {"type": "string"}
         }
       }
     
     - Example Request:
       { "city": "New York" }
     
     - Example Response:
       { "temp": 72, "condition": "sunny" }
   
3. VALIDATION
   User → clicks "Test Endpoint"
   
   → App makes test call to https://myapi.com/weather
   → Verifies endpoint is accessible
   → Verifies response matches output schema
   → Shows "✓ Endpoint verified"
   
4. SUBMISSION
   User → clicks "Publish Skill"
   
   → App constructs registration transaction
   → Hiro Wallet prompts for signature
   → User signs
   
   → Skill added to registry with:
     is_verified: false
     is_active: false
   
   → User sees: "Skill submitted for review. 
                You'll be notified when approved."
   
5. REVIEW (Admin)
   Admin → reviews skill in admin panel
   Admin → tests endpoint
   Admin → approves or rejects
   
   IF approved:
     → Set is_verified: true, is_active: true
     → Skill appears in marketplace
     → Creator receives notification
```

---

### 4.2 AI Agent Flow (Detailed)

#### **Scenario: Autonomous Trading Agent**

```
CONTEXT:
- AI agent is running as a Node.js process
- Agent has its own Stacks wallet (private key in env)
- Agent's task: Monitor whales, alert if >500k STX moves

CODE:
import { X402Client } from 'x402-stacks';

const agent = new TradingAgent({
  wallet: process.env.AGENT_WALLET_KEY,
  budget: 10 // STX per day
});

async function monitorWhales() {
  // 1. DISCOVER SKILL
  // Agent queries skill registry
  const skills = await fetch('https://api.skills.stacks/registry/search?category=analytics');
  const whaleSkill = skills.data.find(s => s.id === 'whale-tracker');
  
  console.log(`Found skill: ${whaleSkill.name}, Price: ${whaleSkill.price_microstx / 1e6} STX`);
  
  // 2. CHECK BUDGET
  if (agent.remainingBudget < whaleSkill.price_microstx / 1e6) {
    console.log('Budget exceeded, waiting...');
    return;
  }
  
  // 3. EXECUTE SKILL
  const client = new X402Client({
    wallet: agent.wallet,
    network: 'mainnet'
  });
  
  try {
    // This auto-handles the 402 payment flow
    const result = await client.executeSkill('whale-tracker', {
      timeframe: '1h',
      minAmount: 500000
    });
    
    // 4. PROCESS RESULT
    console.log(`Found ${result.count} whale moves`);
    
    if (result.count > 0) {
      // Alert logic
      await agent.sendAlert({
        message: `🚨 ${result.count} whale moves detected!`,
        whales: result.whale_moves
      });
    }
    
    // 5. UPDATE BUDGET
    agent.remainingBudget -= whaleSkill.price_microstx / 1e6;
    
  } catch (error) {
    console.error('Skill execution failed:', error);
  }
}

// Run every 10 minutes
setInterval(monitorWhales, 600000);
```

**FLOW BREAKDOWN:**

```
1. DISCOVERY
   Agent → GET /api/registry/search?category=analytics
   Registry → Returns list of analytics skills
   Agent → Finds 'whale-tracker' skill
   Agent → Reads pricing: 0.1 STX

2. BUDGET CHECK
   Agent → checks remainingBudget (10 STX)
   Agent → 0.1 STX < 10 STX ✓ OK to proceed

3. FIRST API CALL (No Payment)
   Agent → GET /api/skills/whale-tracker
           Headers: {}
           Body: { "timeframe": "1h", "minAmount": 500000 }
   
   Server → HTTP 402 Payment Required
            {
              "error": "Payment Required",
              "payment": {
                "amount": "100000",
                "currency": "STX",
                "network": "stacks-mainnet",
                "recipient": "SP2X...",
                "memo": "skill:whale-tracker:exec-xyz789"
              }
            }

4. PAYMENT CONSTRUCTION
   Agent → constructs STX transfer transaction:
           {
             recipient: "SP2X...",
             amount: 100000,
             memo: "skill:whale-tracker:exec-xyz789"
           }

5. TRANSACTION SIGNING
   Agent → signs transaction with private key
   Agent → broadcasts to Stacks network
   Network → returns tx_id: "0xABC123..."

6. CONFIRMATION WAIT
   Agent → polls Stacks API every 2 seconds
   Loop:
     GET /v2/transactions/0xABC123...
     if tx_status === 'success': break
     wait 2 seconds
   
   After ~15-30 seconds → tx confirmed

7. RETRY WITH PAYMENT PROOF
   Agent → GET /api/skills/whale-tracker
           Headers: {
             "X-Payment-Proof": "0xABC123..."
           }
           Body: { "timeframe": "1h", "minAmount": 500000 }

8. PAYMENT VERIFICATION (Server-Side)
   Server → receives request with tx_id
   Server → calls verifyPayment(0xABC123...)
     → Fetches tx from Stacks API
     → Verifies amount: 100000 ✓
     → Verifies recipient: SP2X... ✓
     → Verifies status: success ✓
     → Verifies not already used ✓
     → Marks tx as used in database
   Server → Payment valid ✓

9. SKILL EXECUTION
   Server → executes whale tracker logic
   Server → queries Stacks blockchain for large txs
   Server → formats result

10. RESPONSE
    Server → HTTP 200 OK
             {
               "whale_moves": [
                 {
                   "tx_id": "0x456...",
                   "amount": "750000",
                   "from": "SP1X...",
                   "to": "SP2Y...",
                   "timestamp": 1707584400
                 }
               ],
               "total_volume": "750000",
               "count": 1,
               "timeframe": "1h"
             }

11. AGENT PROCESSING
    Agent → receives result
    Agent → count = 1 > 0
    Agent → triggers alert:
            "🚨 1 whale move detected!
             750k STX moved from SP1X... to SP2Y..."
    
    Agent → updates budget: 10 - 0.1 = 9.9 STX remaining
    Agent → logs execution to local database
    Agent → continues monitoring loop
```

---

### 4.3 Skill Creator Flow (User-Generated Skills)

```
1. DEVELOPMENT
   Creator → builds API endpoint: https://myapi.com/sentiment
   Creator → implements x402 payment check:
   
   app.get('/sentiment', async (req, res) => {
     const txId = req.headers['x-payment-proof'];
     
     if (!txId) {
       return res.status(402).json({
         payment: {
           amount: '50000',  // 0.05 STX
           recipient: 'SP3X...my-wallet'
         }
       });
     }
     
     const valid = await verifyPayment(txId);
     if (!valid) return res.status(402).json({error: 'Invalid'});
     
     // Execute skill logic
     const result = await analyzeSentiment(req.body.text);
     return res.json(result);
   });

2. REGISTRATION
   Creator → visits /create on marketplace
   Creator → fills form with:
     - Skill details
     - API endpoint URL
     - Pricing
     - Schemas
   
   Creator → clicks "Test Endpoint"
   Marketplace → tests https://myapi.com/sentiment
   Marketplace → verifies 402 flow works
   Marketplace → "✓ Endpoint verified"

3. PUBLICATION
   Creator → clicks "Publish Skill"
   Creator → signs with wallet
   Marketplace → adds to registry (is_verified: false)
   Creator → receives "Pending review" message

4. APPROVAL
   Admin → reviews in 24-48 hours
   Admin → manually tests endpoint
   Admin → checks for malicious behavior
   Admin → approves
   
   Marketplace → sets is_verified: true, is_active: true
   Creator → receives notification email
   Skill → appears in marketplace

5. MONETIZATION
   Users → discover and use skill
   Each execution → STX paid to SP3X...my-wallet
   Creator → earns revenue
   
   Creator can view:
     - Total executions
     - Total revenue
     - Success rate
     - Usage trends
```

---

## 5. Technical Implementation Details

### 5.1 Payment Verification Deep Dive

#### **5.1.1 Transaction Verification Checklist**

```typescript
async function verifyPayment(
  txId: string,
  expectedAmount: number,
  expectedRecipient: string,
  skillId: string
): Promise<boolean> {
  
  // 1. Fetch transaction from Stacks blockchain
  const tx = await fetchTransaction(txId);
  if (!tx) {
    console.error('Transaction not found');
    return false;
  }
  
  // 2. Check transaction status
  if (tx.tx_status !== 'success') {
    console.error(`Transaction not successful: ${tx.tx_status}`);
    return false;
  }
  
  // 3. Verify transaction type
  if (tx.tx_type !== 'token_transfer') {
    console.error('Not a token transfer transaction');
    return false;
  }
  
  // 4. Verify amount (must be >= expected)
  const actualAmount = parseInt(tx.token_transfer.amount);
  if (actualAmount < expectedAmount) {
    console.error(`Insufficient payment: ${actualAmount} < ${expectedAmount}`);
    return false;
  }
  
  // 5. Verify recipient address
  if (tx.token_transfer.recipient_address !== expectedRecipient) {
    console.error('Wrong recipient address');
    return false;
  }
  
  // 6. Verify memo contains skill ID (optional but recommended)
  const memo = tx.token_transfer.memo || '';
  if (!memo.includes(`skill:${skillId}`)) {
    console.warn('Memo does not match skill ID');
    // Don't fail, but log warning
  }
  
  // 7. Check transaction age (prevent old tx reuse)
  const txTimestamp = tx.burn_block_time * 1000; // Convert to ms
  const txAge = Date.now() - txTimestamp;
  const MAX_AGE = 3600000; // 1 hour
  
  if (txAge > MAX_AGE) {
    console.error(`Transaction too old: ${txAge}ms`);
    return false;
  }
  
  // 8. Check for double-spend (has tx been used before?)
  const alreadyUsed = await db.query(
    'SELECT 1 FROM skill_executions WHERE tx_id = $1',
    [txId]
  );
  
  if (alreadyUsed.rows.length > 0) {
    console.error('Transaction already used');
    return false;
  }
  
  // 9. Mark transaction as used (atomic operation)
  await db.query(
    'INSERT INTO skill_executions (skill_id, tx_id, status, payment_amount_microstx, executed_at) VALUES ($1, $2, $3, $4, NOW())',
    [skillId, txId, 'pending', actualAmount]
  );
  
  // All checks passed
  return true;
}
```

---

#### **5.1.2 Stacks API Integration**

```typescript
import { StacksMainnet } from '@stacks/network';
import { 
  TransactionsApi, 
  Configuration 
} from '@stacks/blockchain-api-client';

const config = new Configuration({
  basePath: 'https://api.mainnet.hiro.so'
});

const txApi = new TransactionsApi(config);

async function fetchTransaction(txId: string) {
  try {
    const response = await txApi.getTransactionById({ txId });
    return response;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}
```

---

### 5.2 Database Schemas (Complete)

```sql
-- Skills registry
CREATE TABLE skills (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category VARCHAR(50) NOT NULL,
  
  -- Pricing
  price_microstx BIGINT NOT NULL,
  
  -- API details
  endpoint_url TEXT NOT NULL,
  
  -- Wallet addresses
  creator_address VARCHAR(50) NOT NULL,
  treasury_address VARCHAR(50) NOT NULL,
  
  -- Schemas
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  example_request JSONB,
  example_response JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Stats
  total_executions INTEGER DEFAULT 0,
  total_revenue_microstx BIGINT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.0,
  avg_response_time_ms INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  documentation_url TEXT,
  support_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  
  CONSTRAINT valid_price CHECK (price_microstx > 0),
  CONSTRAINT valid_success_rate CHECK (success_rate >= 0 AND success_rate <= 100)
);

-- Skill executions log
CREATE TABLE skill_executions (
  id SERIAL PRIMARY KEY,
  skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE CASCADE,
  
  -- Payment info
  tx_id VARCHAR(100) UNIQUE NOT NULL,
  payment_amount_microstx BIGINT NOT NULL,
  payer_address VARCHAR(50),
  
  -- Execution details
  input JSONB,
  output JSONB,
  
  -- Status
  status VARCHAR(20) NOT NULL,  -- pending, success, failed
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Performance
  response_time_ms INTEGER,
  
  -- Timestamps
  executed_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'success', 'failed'))
);

-- Skill categories
CREATE TABLE skill_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0
);

-- User favorites (future feature)
CREATE TABLE user_favorites (
  user_address VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_address, skill_id)
);

-- Skill reviews (future feature)
CREATE TABLE skill_reviews (
  id SERIAL PRIMARY KEY,
  skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE CASCADE,
  user_address VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (skill_id, user_address)
);

-- Indexes for performance
CREATE INDEX idx_skills_category ON skills(category) WHERE is_active = true;
CREATE INDEX idx_skills_verified ON skills(is_verified, is_active);
CREATE INDEX idx_skills_created ON skills(created_at DESC);
CREATE INDEX idx_executions_skill ON skill_executions(skill_id, executed_at DESC);
CREATE INDEX idx_executions_tx ON skill_executions(tx_id);
CREATE INDEX idx_executions_status ON skill_executions(status, executed_at);
CREATE INDEX idx_executions_payer ON skill_executions(payer_address, executed_at);

-- Insert default categories
INSERT INTO skill_categories (id, name, description, display_order) VALUES
  ('analytics', 'Analytics', 'Blockchain data analysis and metrics', 1),
  ('content', 'Content', 'AI-powered content creation and editing', 2),
  ('social', 'Social', 'Social media analysis and automation', 3),
  ('defi', 'DeFi', 'Decentralized finance tools', 4),
  ('utilities', 'Utilities', 'General purpose utilities', 5);
```

---

### 5.3 API Routes Specification

#### **Public API Routes**

```typescript
// Registry & Discovery
GET    /api/registry/skills              // List all skills
GET    /api/registry/skills/{skill-id}   // Get skill details
GET    /api/registry/search               // Search skills
GET    /api/registry/categories           // List categories

// Skill execution (x402 protected)
GET    /api/skills/{skill-id}             // Execute skill
POST   /api/skills/{skill-id}             // Execute skill (POST)

// Stats (public)
GET    /api/stats/global                  // Platform stats
GET    /api/stats/skills/{skill-id}       // Skill-specific stats

// Health check
GET    /api/health                        // Service health
```

#### **Protected API Routes** *(Requires authentication)*

```typescript
// Skill management (creator only)
POST   /api/registry/create               // Create new skill
PUT    /api/registry/skills/{skill-id}    // Update skill
DELETE /api/registry/skills/{skill-id}    // Delete skill

// Creator dashboard
GET    /api/creator/skills                // Get my skills
GET    /api/creator/earnings              // Get earnings
GET    /api/creator/analytics             // Get detailed analytics

// Admin routes
GET    /api/admin/pending                 // Get pending skills
POST   /api/admin/verify/{skill-id}       // Verify skill
POST   /api/admin/reject/{skill-id}       // Reject skill
```

---

### 5.4 Frontend Component Structure

```
/app
  /page.tsx                    # Homepage
  /layout.tsx                  # Root layout
  
  /skills
    /page.tsx                  # Skills directory
    /[skillId]
      /page.tsx                # Skill detail page
  
  /create
    /page.tsx                  # Create skill form
  
  /docs
    /page.tsx                  # Documentation hub
    /getting-started
      /page.tsx
    /integration
      /page.tsx
  
  /creator
    /dashboard
      /page.tsx                # Creator dashboard
  
  /api
    /registry
      /skills
        /route.ts              # GET all skills
        /[skillId]
          /route.ts            # GET skill by ID
      /search
        /route.ts              # Search skills
      /create
        /route.ts              # Create skill
    
    /skills
      /[skillId]
        /route.ts              # Execute skill (x402)
    
    /stats
      /global
        /route.ts
      /skills
        /[skillId]
          /route.ts

/components
  /wallet
    /WalletConnect.tsx         # Wallet connection button
    /WalletProvider.tsx        # Wallet context provider
  
  /skills
    /SkillCard.tsx             # Skill card component
    /SkillGrid.tsx             # Grid of skill cards
    /SkillDetail.tsx           # Skill detail view
    /SkillDemo.tsx             # Live demo component
  
  /payment
    /PaymentButton.tsx         # Execute/pay button
    /PaymentModal.tsx          # Payment confirmation
    /PaymentStatus.tsx         # Payment status indicator
  
  /common
    /Header.tsx
    /Footer.tsx
    /Navbar.tsx
    /SearchBar.tsx

/lib
  /x402
    /client.ts                 # X402Client class
    /payment.ts                # Payment utilities
    /verify.ts                 # Payment verification
  
  /stacks
    /api.ts                    # Stacks API client
    /wallet.ts                 # Wallet utilities
  
  /db
    /client.ts                 # Database client
    /queries.ts                # Database queries
  
  /utils
    /format.ts                 # Formatting utilities
    /validation.ts             # Input validation

/types
  /skill.ts                    # Skill types
  /payment.ts                  # Payment types
  /api.ts                      # API types
```

---

## 6. Development Timeline

### Day 1: Foundation & x402 Core
**Goals:**
- Set up project structure
- Implement basic x402 payment flow
- Deploy test endpoint

**Tasks:**
- [ ] Initialize Next.js project
- [ ] Set up PostgreSQL database
- [ ] Create database schema
- [ ] Implement payment verification function
- [ ] Create first test endpoint with 402 flow
- [ ] Test with Stacks testnet wallet
- [ ] Document x402 implementation

**Deliverables:**
- Working x402 payment verification
- Test endpoint that requires payment
- Documentation of flow

---

### Day 2: First Skill (Whale Tracker)
**Goals:**
- Build complete Whale Tracker skill
- End-to-end test of payment → execution

**Tasks:**
- [ ] Implement whale tracker logic
- [ ] Integrate with Stacks blockchain API
- [ ] Add x402 payment gate
- [ ] Test full flow (payment → execution → response)
- [ ] Add database logging
- [ ] Write API documentation
- [ ] Create usage examples

**Deliverables:**
- Fully functional Whale Tracker skill
- Tested payment flow
- API docs

---

### Day 3-4: Remaining Skills
**Goals:**
- Build 4 more skills
- Ensure consistency

**Day 3:**
- [ ] Content Craft skill (OpenAI integration)
- [ ] Stacks Scout skill (on-chain metrics)

**Day 4:**
- [ ] Profile Pro skill (social analysis)
- [ ] Meme Radar skill (trend detection)
- [ ] Standardize all skill APIs
- [ ] Test all payment flows

**Deliverables:**
- 5 production-ready skills
- Consistent API patterns
- Complete test coverage

---

### Day 5: Marketplace Frontend
**Goals:**
- Build marketplace UI
- Wallet integration

**Tasks:**
- [ ] Create homepage
- [ ] Build skills directory page
- [ ] Build skill detail pages
- [ ] Implement wallet connection (Hiro/Leather)
- [ ] Build payment UI flow
- [ ] Add live demo components
- [ ] Implement search/filter
- [ ] Add responsive design

**Deliverables:**
- Complete marketplace UI
- Working wallet integration
- Live demo functionality

---

### Day 6: Client SDK & Integration
**Goals:**
- Build x402-stacks library
- Documentation
- Testing

**Tasks:**
- [ ] Build X402Client class
- [ ] Implement auto-payment handling
- [ ] Add error handling
- [ ] Write SDK documentation
- [ ] Create integration examples
- [ ] Test with all skills
- [ ] Publish to npm (optional)

**Deliverables:**
- Working client SDK
- Integration guide
- Code examples

---

### Day 7: Polish & Demo
**Goals:**
- Final testing
- Demo video
- Deployment

**Tasks:**
- [ ] End-to-end testing all flows
- [ ] Fix bugs
- [ ] UI/UX polish
- [ ] Record demo video (5 min)
- [ ] Write README
- [ ] Deploy to production
- [ ] Create submission materials
- [ ] Submit to hackathon

**Deliverables:**
- Production deployment
- Demo video
- Complete documentation
- Hackathon submission

---

## 7. Success Metrics

### 7.1 Demo Success Criteria
- [ ] All 5 skills execute successfully
- [ ] Payment flow works smoothly (< 30 sec)
- [ ] No errors during demo
- [ ] UI is polished and professional
- [ ] Video explains concept clearly

### 7.2 Technical Success Criteria
- [ ] 100% payment verification accuracy
- [ ] < 3 second skill execution time (avg)
- [ ] Zero double-spend vulnerabilities
- [ ] Mobile-responsive UI
- [ ] Clean, documented code

### 7.3 Hackathon Win Criteria
- [ ] Clear x402 protocol implementation
- [ ] Demonstrates Stacks blockchain integration
- [ ] Shows both human and agent use cases
- [ ] Production-ready quality
- [ ] Novel approach to the problem
- [ ] Bitcoin-secured narrative is clear

---

## 8. Risk Mitigation

### 8.1 Technical Risks

**Risk:** Payment verification fails or has security holes
**Mitigation:**
- Implement comprehensive verification checks
- Test with multiple transaction scenarios
- Add transaction replay prevention
- Review security best practices

**Risk:** Stacks API rate limiting
**Mitigation:**
- Implement caching for transaction lookups
- Use Redis for 15-min cache
- Add retry logic with exponential backoff

**Risk:** Skills fail during demo
**Mitigation:**
- Test all skills thoroughly before demo
- Have backup test data
- Add comprehensive error handling
- Create fallback demo video

---

### 8.2 Time Risks

**Risk:** Can't complete all 5 skills in time
**Mitigation:**
- Prioritize 3 core skills (Whale Tracker, Content Craft, Stacks Scout)
- Make skills 4-5 stretch goals
- Reuse code patterns from first skill

**Risk:** Wallet integration takes too long
**Mitigation:**
- Use existing Stacks.js Connect library
- Focus on Hiro Wallet only initially
- Add other wallets as stretch goal

---

### 8.3 Demo Risks

**Risk:** Network issues during live demo
**Mitigation:**
- Record backup video demo
- Test on testnet AND mainnet before demo
- Have screenshots ready
- Prepare recorded walkthrough

**Risk:** Payment takes too long to confirm
**Mitigation:**
- Use appropriate fee settings for fast confirmation
- Show "waiting for confirmation" UI clearly
- Have pre-confirmed demo transactions ready

---

## 9. Future Enhancements (Post-Hackathon)

### Phase 2 Features
- [ ] User-generated skill submissions
- [ ] Skill reviews and ratings
- [ ] Advanced analytics dashboard
- [ ] Subscription pricing model (daily/weekly/monthly passes)
- [ ] Skill marketplace revenue sharing
- [ ] Multi-signature treasury wallet

### Phase 3 Features
- [ ] sBTC payment support
- [ ] Clarity smart contract for escrow
- [ ] Skill composition (chain multiple skills)
- [ ] Webhooks for async execution
- [ ] GraphQL API
- [ ] Mobile app (React Native)

---

## 10. Resources & References

### Documentation Links
- x402 Protocol: https://x402.org
- x402.jobs: https://x402.jobs
- Stacks Docs: https://docs.stacks.co
- Stacks.js: https://github.com/hirosystems/stacks.js
- Hiro API: https://docs.hiro.so

### API Endpoints
- Stacks Mainnet API: https://api.mainnet.hiro.so
- Stacks Testnet API: https://api.testnet.hiro.so
- Stacks Explorer: https://explorer.hiro.so

### Development Tools
- Clarinet (Clarity): https://github.com/hirosystems/clarinet
- Stacks Wallet: https://wallet.hiro.so
- Leather Wallet: https://leather.io

---

## 11. Submission Requirements

### GitHub Repository Must Include
- [ ] Complete source code
- [ ] README with:
  - Project description
  - Setup instructions
  - Demo video link
  - Architecture diagram
  - API documentation
- [ ] Live deployment link
- [ ] Demo video (5 min max)

### Demo Video Must Show
- [ ] Problem statement (30 sec)
- [ ] Solution overview (1 min)
- [ ] Live demo of human flow (1.5 min)
- [ ] Live demo of agent flow (1.5 min)
- [ ] Why Stacks/x402 matters (30 sec)

### Documentation Must Include
- [ ] x402 protocol integration guide
- [ ] Skill creation guide
- [ ] API reference
- [ ] Integration examples
- [ ] Architecture explanation

---

## 12. Contact & Support

**Project Lead:** [Your Name]  
**Email:** [Your Email]  
**GitHub:** [Your GitHub]  
**Discord:** [Your Discord]  

**Hackathon:** x402 Stacks Challenge  
**Dates:** Feb 9-16, 2026  
**Prize:** $3,000 USD  

---

**End of PRD**

---

*This document is a living specification and may be updated as development progresses.*