import { SkillCard } from "@/components/skills/SkillCard";
import type { Skill } from "@/types/skill";

interface SkillGridProps {
  skills: Skill[];
  emptyMessage?: string;
}

export function SkillGrid({ skills, emptyMessage = "No skills found." }: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
