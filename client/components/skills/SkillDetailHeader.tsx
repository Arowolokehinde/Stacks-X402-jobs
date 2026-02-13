import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Fish,
  PenTool,
  BarChart3,
  UserCheck,
  Laugh,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatSTX } from "@/lib/utils/format";
import type { SerializableSkill } from "@/types/skill";

const ICON_MAP: Record<string, LucideIcon> = {
  Fish,
  PenTool,
  BarChart3,
  UserCheck,
  Laugh,
  Zap,
};

const COLOR_MAP: Record<string, string> = {
  violet: "text-violet-500",
  orange: "text-orange-500",
  emerald: "text-emerald-500",
  pink: "text-pink-500",
  yellow: "text-yellow-500",
};

const BG_MAP: Record<string, string> = {
  violet: "bg-violet-500/10",
  orange: "bg-orange-500/10",
  emerald: "bg-emerald-500/10",
  pink: "bg-pink-500/10",
  yellow: "bg-yellow-500/10",
};

const BADGE_COLOR_MAP: Record<string, string> = {
  analytics: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  content: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  social: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

interface SkillDetailHeaderProps {
  skill: SerializableSkill;
}

export function SkillDetailHeader({ skill }: SkillDetailHeaderProps) {
  const Icon = ICON_MAP[skill.icon] ?? Zap;
  const iconColor = COLOR_MAP[skill.color] ?? "text-primary";
  const iconBg = BG_MAP[skill.color] ?? "bg-primary/10";
  const badgeColor = BADGE_COLOR_MAP[skill.category] ?? "";

  return (
    <div>
      {/* Back link */}
      <Link
        href="/skills"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Skills
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Icon */}
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
            iconBg
          )}
        >
          <Icon className={cn("h-8 w-8", iconColor)} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {skill.name}
            </h1>
            <Badge variant="outline" className={cn("capitalize", badgeColor)}>
              {skill.category}
            </Badge>
          </div>

          <p className="text-muted-foreground max-w-2xl">
            {skill.longDescription}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-primary text-base">
                {formatSTX(skill.priceMicroSTX)}
              </span>
              <span className="text-muted-foreground">per call</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">
              Data: <span className="text-foreground">{skill.dataSource}</span>
            </span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">
              Method:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                {skill.method}
              </code>
            </span>
          </div>
        </div>

        {/* Execute CTA (placeholder — wired in M7) */}
        <Button size="lg" className="shrink-0 gap-2 mt-2 sm:mt-0">
          <Zap className="h-4 w-4" />
          Execute — {formatSTX(skill.priceMicroSTX)}
        </Button>
      </div>
    </div>
  );
}
