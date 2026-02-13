"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/skills-config";

interface CategoryFilterProps {
  value: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
        <TabsTrigger
          value="all"
          className="rounded-full border border-transparent px-4 py-1.5 text-sm data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          All Skills
        </TabsTrigger>
        {CATEGORIES.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="rounded-full border border-transparent px-4 py-1.5 text-sm data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
