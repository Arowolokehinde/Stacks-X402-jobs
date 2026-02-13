import { z } from "zod";
import type { Skill, SkillId, SkillCategory, CategoryMeta } from "@/types/skill";

// ── Zod Input Schemas ──────────────────────────────────────

export const whaleTrackerInputSchema = z.object({
  timeframe: z
    .enum(["24h", "7d", "30d"])
    .default("24h")
    .describe("Time window to scan"),
  minAmount: z
    .coerce.number()
    .int()
    .min(10_000)
    .default(100_000)
    .describe("Minimum STX amount to qualify as whale"),
  limit: z
    .coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Max results to return"),
});

export const contentCraftInputSchema = z.object({
  text: z
    .string()
    .min(10, "Text must be at least 10 characters")
    .max(5000, "Text must be under 5000 characters")
    .describe("Content to rewrite"),
  tone: z
    .enum(["professional", "casual", "technical"])
    .default("professional")
    .describe("Target writing tone"),
  maxLength: z
    .coerce.number()
    .int()
    .min(50)
    .max(2000)
    .default(500)
    .describe("Max word count for output"),
});

export const stacksScoutInputSchema = z.object({
  metrics: z
    .array(z.enum(["tvl", "active_wallets", "transactions", "block_height"]))
    .min(1)
    .default(["block_height", "transactions"])
    .describe("Which metrics to fetch"),
  timeframe: z
    .enum(["24h", "7d", "30d"])
    .default("24h")
    .describe("Time window for data"),
});

export const profileProInputSchema = z.object({
  profileUrl: z
    .string()
    .url("Must be a valid URL")
    .describe("Social profile URL to audit"),
  analysisDepth: z
    .enum(["basic", "detailed"])
    .default("basic")
    .describe("Depth of analysis"),
});

export const memeRadarInputSchema = z.object({
  limit: z
    .coerce.number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Number of trending memes"),
  category: z
    .enum(["all", "bitcoin", "stacks", "defi"])
    .default("all")
    .describe("Meme category to search"),
});

// ── Input schema map ───────────────────────────────────────
export const SKILL_INPUT_SCHEMAS: Record<SkillId, z.ZodType> = {
  "whale-tracker": whaleTrackerInputSchema,
  "content-craft": contentCraftInputSchema,
  "stacks-scout": stacksScoutInputSchema,
  "profile-pro": profileProInputSchema,
  "meme-radar": memeRadarInputSchema,
};

// ── Category Metadata ──────────────────────────────────────
export const CATEGORIES: CategoryMeta[] = [
  { id: "analytics", label: "Analytics", description: "Blockchain data & on-chain metrics" },
  { id: "content",   label: "Content",   description: "AI-powered writing & rewriting" },
  { id: "social",    label: "Social",    description: "Social media insights & trends" },
];

// ── The 5 Launch Skills ────────────────────────────────────

const makeSkill = (
  partial: Omit<Skill, "priceSTX" | "endpoint" | "method" | "totalExecutions" | "successRate" | "avgResponseTimeMs"> &
    Partial<Pick<Skill, "method">>
): Skill => ({
  ...partial,
  method: partial.method ?? "GET",
  priceSTX: partial.priceMicroSTX / 1_000_000,
  endpoint: `/api/skills/${partial.id}`,
  totalExecutions: 0,
  successRate: 100,
  avgResponseTimeMs: 0,
});

export const SKILLS: Record<SkillId, Skill> = {
  "whale-tracker": makeSkill({
    id: "whale-tracker",
    name: "Whale Tracker",
    description: "Monitor large STX transactions in real-time",
    longDescription:
      "Track whale-sized STX movements across the Stacks blockchain. Get instant alerts on transactions above your threshold, including sender/receiver addresses, amounts, and block context. Perfect for traders, analysts, and automated agents watching market-moving flows.",
    category: "analytics",
    priceMicroSTX: 100_000, // 0.1 STX
    inputSchema: whaleTrackerInputSchema,
    exampleInput: { timeframe: "24h", minAmount: 100000, limit: 10 },
    exampleOutput: {
      whale_moves: [
        {
          tx_id: "0xabc123...",
          amount: "500000",
          from: "SP2X...",
          to: "SP3Y...",
          timestamp: 1707580800,
          block_height: 150000,
        },
      ],
      total_volume: "2500000",
      count: 5,
      timeframe: "24h",
    },
    icon: "Fish",
    color: "violet",
    gradient: "from-violet-500/20 to-indigo-500/20",
    dataSource: "Hiro Stacks API",
  }),

  "content-craft": makeSkill({
    id: "content-craft",
    name: "Content Craft",
    description: "AI-powered professional content rewriting",
    longDescription:
      "Transform any text into polished, professional content using GPT-4. Choose your target tone — professional, casual, or technical — and get publication-ready copy back in seconds. Ideal for blog posts, marketing copy, documentation, or social media.",
    category: "content",
    priceMicroSTX: 250_000, // 0.25 STX
    method: "POST",
    inputSchema: contentCraftInputSchema,
    exampleInput: {
      text: "Our product is really good and helps people do stuff faster.",
      tone: "professional",
      maxLength: 500,
    },
    exampleOutput: {
      original: "Our product is really good and helps people do stuff faster.",
      rewritten:
        "Our platform delivers measurable productivity gains, enabling teams to accomplish more in less time with an intuitive, purpose-built workflow.",
      tone: "professional",
      word_count: 22,
      changes_summary: "Improved clarity, authority, and specificity",
    },
    icon: "PenTool",
    color: "orange",
    gradient: "from-orange-500/20 to-amber-500/20",
    dataSource: "OpenAI GPT-4",
  }),

  "stacks-scout": makeSkill({
    id: "stacks-scout",
    name: "Stacks Scout",
    description: "Real-time Stacks blockchain analytics & metrics",
    longDescription:
      "Get a comprehensive snapshot of the Stacks blockchain: TVL, active wallets, transaction volume, and block height — all in one call. Select the metrics you care about and the time window. Built for dashboards, research reports, and automated monitoring agents.",
    category: "analytics",
    priceMicroSTX: 500_000, // 0.5 STX
    inputSchema: stacksScoutInputSchema,
    exampleInput: {
      metrics: ["block_height", "transactions", "active_wallets"],
      timeframe: "24h",
    },
    exampleOutput: {
      block_height: 150000,
      transactions: { count: 50000, volume: "2500000 STX" },
      active_wallets: { count: 15000, change_24h: "+8.2%" },
      timestamp: 1707580800,
    },
    icon: "BarChart3",
    color: "emerald",
    gradient: "from-emerald-500/20 to-teal-500/20",
    dataSource: "Hiro Stacks API",
  }),

  "profile-pro": makeSkill({
    id: "profile-pro",
    name: "Profile Pro",
    description: "AI-powered social profile audit & recommendations",
    longDescription:
      "Submit any social profile URL and receive a detailed AI audit: engagement score, strengths, weaknesses, and actionable recommendations to grow your audience. Powered by GPT-4 analysis with platform-specific insights.",
    category: "social",
    priceMicroSTX: 2_000_000, // 2 STX
    method: "POST",
    inputSchema: profileProInputSchema,
    exampleInput: {
      profileUrl: "https://twitter.com/staborotechnerd",
      analysisDepth: "detailed",
    },
    exampleOutput: {
      profile: { username: "staborotechnerd", platform: "twitter", followers: 5000 },
      score: 85,
      strengths: ["Consistent posting schedule", "High engagement rate"],
      weaknesses: ["Limited use of hashtags", "Bio could be clearer"],
      suggestions: [
        "Add 2-3 relevant hashtags per post",
        "Update bio to highlight core expertise",
        "Increase posting frequency to 2x/day",
      ],
    },
    icon: "UserCheck",
    color: "pink",
    gradient: "from-pink-500/20 to-rose-500/20",
    dataSource: "OpenAI GPT-4",
  }),

  "meme-radar": makeSkill({
    id: "meme-radar",
    name: "Meme Radar",
    description: "Trending crypto memes & sentiment detection",
    longDescription:
      "Scan Twitter and Reddit for the hottest crypto memes in real-time. Get sentiment analysis (bullish/bearish), trending hashtags, popularity scores, and source tracking. Filter by Bitcoin, Stacks, DeFi, or catch everything. Great for social trading signals and community management.",
    category: "social",
    priceMicroSTX: 100_000, // 0.1 STX
    inputSchema: memeRadarInputSchema,
    exampleInput: { limit: 10, category: "all" },
    exampleOutput: {
      trending_memes: [
        {
          title: "Number Go Up",
          description: "Bitcoin price celebration",
          sentiment: "bullish",
          popularity_score: 95,
          sources: ["twitter", "reddit"],
          first_seen: 1707580800,
        },
      ],
      overall_sentiment: "bullish",
      trending_hashtags: ["#Bitcoin", "#HODL", "#Stacks"],
      timestamp: 1707580800,
    },
    icon: "Laugh",
    color: "yellow",
    gradient: "from-yellow-500/20 to-lime-500/20",
    dataSource: "Social APIs",
  }),
};

// ── Helpers ────────────────────────────────────────────────

/** Get a single skill by ID, or undefined */
export function getSkill(id: string): Skill | undefined {
  return SKILLS[id as SkillId];
}

/** Get all skills as an array */
export function getAllSkills(): Skill[] {
  return Object.values(SKILLS);
}

/** Get skills filtered by category */
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return getAllSkills().filter((s) => s.category === category);
}

/** Get the zod input schema for a skill */
export function getSkillInputSchema(id: SkillId): z.ZodType {
  return SKILL_INPUT_SCHEMAS[id];
}
