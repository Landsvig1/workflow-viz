import { workflows, FEATURED_WORKFLOW_ID } from "@/data";
import { Rail, type RailItem } from "@/components/Rail";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items: RailItem[] = workflows.map((w) => ({
    id: w.id,
    title: w.title,
    category: w.category,
  }));

  return (
    <div className="h-screen flex bg-[#03030a] bg-grid overflow-hidden">
      <Rail items={items} featuredId={FEATURED_WORKFLOW_ID} />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
