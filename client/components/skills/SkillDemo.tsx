"use client";

import { useState } from "react";
import { Play, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SerializableSkill } from "@/types/skill";

interface SkillDemoProps {
  skill: SerializableSkill;
}

function JsonBlock({ data, label }: { data: unknown; label: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Copy"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm font-mono leading-relaxed">
        <code>{json}</code>
      </pre>
    </div>
  );
}

export function SkillDemo({ skill }: SkillDemoProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Try it out</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {skill.method} {skill.endpoint}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="input">
          <TabsList className="mb-4">
            <TabsTrigger value="input">Example Input</TabsTrigger>
            <TabsTrigger value="output">Example Output</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-0">
            <JsonBlock data={skill.exampleInput} label="Request body" />
          </TabsContent>

          <TabsContent value="output" className="mt-0">
            <JsonBlock data={skill.exampleOutput} label="Response" />
          </TabsContent>
        </Tabs>

        {/* Execute button (placeholder — payment flow wired in M7) */}
        <Button className="w-full mt-5 gap-2" size="lg">
          <Play className="h-4 w-4" />
          Execute with STX Payment
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Requires a connected Stacks wallet. Payment is atomic via x402.
        </p>
      </CardContent>
    </Card>
  );
}
