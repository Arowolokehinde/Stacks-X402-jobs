export default function SkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Skill Detail</h1>
      <p className="text-muted-foreground mt-2">Skill detail page — coming soon.</p>
    </main>
  );
}
