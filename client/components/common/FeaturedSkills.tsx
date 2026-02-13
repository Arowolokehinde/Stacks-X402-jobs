import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllSkills } from "@/lib/skills-config";
import { SkillCard } from "@/components/skills/SkillCard";

export function FeaturedSkills() {
  // Pick 3 featured: whale-tracker, content-craft, stacks-scout
  const all = getAllSkills();
  const featured = all.slice(0, 3);

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Featured Skills
          </h2>
          <p className="mt-2 text-muted-foreground">
            Ready-to-use AI services — pay only when you execute.
          </p>
        </div>
        <Link
          href="/skills"
          className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featured.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {/* Mobile "view all" link */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/skills"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all skills
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
