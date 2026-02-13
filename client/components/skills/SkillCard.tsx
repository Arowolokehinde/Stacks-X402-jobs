import Link from "next/link";
import {
  Fish,
  PenTool,
  BarChart3,
  UserCheck,
  Laugh,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatSTX } from "@/lib/utils/format";
import type { Skill, SkillSummary } from "@/types/skill";

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

const BADGE_COLOR_MAP: Record<string, string> = {
  analytics: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
  content: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
  social: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20",
};

interface SkillCardProps {
  skill: Skill | SkillSummary;
  className?: string;
}

export function SkillCard({ skill, className }: SkillCardProps) {
  const Icon = ICON_MAP[skill.icon] ?? Zap;
  const iconColor = COLOR_MAP[skill.color] ?? "text-primary";
  const badgeColor = BADGE_COLOR_MAP[skill.category] ?? "";

  return (
    <Link href={`/skills/${skill.id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
          "border-border/50 hover:border-primary/30",
          className
        )}
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            skill.gradient
          )}
        />

        <CardContent className="relative p-5">
          {/* Header: Icon + Price */}
          <div className="flex items-start justify-between mb-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                "bg-muted group-hover:bg-background/80 transition-colors"
              )}
            >
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
            >
              {formatSTX(skill.priceMicroSTX)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
            {skill.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {skill.description}
          </p>

          {/* Footer: Category + Executions */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("text-xs capitalize", badgeColor)}>
              {skill.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {skill.totalExecutions > 0
                ? `${skill.totalExecutions.toLocaleString()} runs`
                : "New"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
