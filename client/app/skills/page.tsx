"use client";

import { useMemo, useState } from "react";
import { getAllSkills } from "@/lib/skills-config";
import { SkillGrid } from "@/components/skills/SkillGrid";
import { CategoryFilter } from "@/components/skills/CategoryFilter";
import { SearchBar } from "@/components/skills/SearchBar";
import type { SkillCategory } from "@/types/skill";

export default function SkillsPage() {
  const allSkills = useMemo(() => getAllSkills(), []);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = allSkills;

    if (category !== "all") {
      result = result.filter((s) => s.category === (category as SkillCategory));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allSkills, category, search]);

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Skills Marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Browse {allSkills.length} pay-per-use AI skills. Pick one, pay with STX, get results instantly.
        </p>
      </div>

      {/* Toolbar: Category filter + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <CategoryFilter value={category} onChange={setCategory} />
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Results */}
      <SkillGrid
        skills={filtered}
        emptyMessage={
          search
            ? `No skills match "${search}".`
            : "No skills in this category yet."
        }
      />

      {/* Result count */}
      {filtered.length > 0 && filtered.length < allSkills.length && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filtered.length} of {allSkills.length} skills
        </p>
      )}
    </main>
  );
}
