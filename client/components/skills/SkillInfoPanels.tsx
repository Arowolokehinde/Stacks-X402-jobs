import {
  Clock,
  CheckCircle2,
  Activity,
  Database,
  Code2,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatSTX } from "@/lib/utils/format";
import type { SerializableSkill } from "@/types/skill";

interface SkillInfoPanelsProps {
  skill: SerializableSkill;
}

export function SkillInfoPanels({ skill }: SkillInfoPanelsProps) {
  return (
    <div className="space-y-5">
      {/* Pricing & Execution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price per call</span>
            <span className="font-mono font-semibold text-primary">
              {formatSTX(skill.priceMicroSTX)}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment</span>
            <span className="text-sm">x402 Facilitator</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Settlement</span>
            <span className="text-sm">Atomic (1 block)</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#F7931A]" />
            Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Avg response
            </span>
            <span className="text-sm">
              {skill.avgResponseTimeMs > 0
                ? `${skill.avgResponseTimeMs}ms`
                : "—"}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Success rate
            </span>
            <span className="text-sm">{skill.successRate}%</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total executions</span>
            <span className="text-sm">
              {skill.totalExecutions > 0
                ? skill.totalExecutions.toLocaleString()
                : "New"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Technical */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-500" />
            API Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Endpoint</span>
            <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
              {skill.endpoint}
            </code>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Method</span>
            <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
              {skill.method}
            </code>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Data source
            </span>
            <span className="text-sm">{skill.dataSource}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
