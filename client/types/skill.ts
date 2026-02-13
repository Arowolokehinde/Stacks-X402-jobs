import type { z } from "zod";

// ── Skill IDs ──────────────────────────────────────────────
export const SKILL_IDS = [
  "whale-tracker",
  "content-craft",
  "stacks-scout",
  "profile-pro",
  "meme-radar",
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

// ── Categories ─────────────────────────────────────────────
export const SKILL_CATEGORIES = [
  "analytics",
  "content",
  "social",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface CategoryMeta {
  id: SkillCategory;
  label: string;
  description: string;
}

// ── Skill ──────────────────────────────────────────────────
export interface Skill {
  id: SkillId;
  name: string;
  description: string;
  longDescription: string;
  category: SkillCategory;

  // Pricing (canonical in microSTX — integers only)
  priceMicroSTX: number;
  /** Convenience getter: priceMicroSTX / 1_000_000 */
  priceSTX: number;

  // API surface
  endpoint: string;
  method: "GET" | "POST";
  inputSchema: z.ZodType;
  exampleInput: Record<string, unknown>;
  exampleOutput: Record<string, unknown>;

  // Visual / branding
  icon: string;       // Lucide icon name
  color: string;      // Tailwind color class, e.g. "violet" | "orange" | "emerald"
  gradient: string;   // Tailwind gradient classes for cards

  // Data source
  dataSource: string; // e.g. "Hiro Stacks API", "OpenAI GPT-4"

  // Stats (populated from DB, defaults here)
  totalExecutions: number;
  successRate: number;
  avgResponseTimeMs: number;
}

// ── Serializable Skill (no Zod schema — safe to pass to Client Components) ──
export type SerializableSkill = Omit<Skill, "inputSchema">;

// ── Skill Card (lighter type for lists) ────────────────────
export type SkillSummary = Pick<
  Skill,
  | "id"
  | "name"
  | "description"
  | "category"
  | "priceMicroSTX"
  | "priceSTX"
  | "icon"
  | "color"
  | "gradient"
  | "totalExecutions"
  | "successRate"
>;
