import { notFound } from "next/navigation";
import { getSkill, getAllSkills } from "@/lib/skills-config";
import { SkillDetailHeader } from "@/components/skills/SkillDetailHeader";
import { SkillDemo } from "@/components/skills/SkillDemo";
import { SkillInfoPanels } from "@/components/skills/SkillInfoPanels";

// Pre-generate all 5 skill pages at build time
export function generateStaticParams() {
  return getAllSkills().map((s) => ({ skillId: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  const skill = getSkill(skillId);
  if (!skill) return { title: "Skill Not Found" };
  return {
    title: `${skill.name} — x402.skills`,
    description: skill.description,
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  const skill = getSkill(skillId);

  if (!skill) {
    notFound();
  }

  // Strip Zod inputSchema — not serializable to client components
  const { inputSchema: _, ...serializableSkill } = skill;

  return (
    <main className="container mx-auto px-4 py-10">
      <SkillDetailHeader skill={serializableSkill} />

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Demo panel */}
        <div className="lg:col-span-2">
          <SkillDemo skill={serializableSkill} />
        </div>

        {/* Sidebar: Info panels */}
        <div>
          <SkillInfoPanels skill={serializableSkill} />
        </div>
      </div>
    </main>
  );
}
