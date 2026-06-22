import { notFound } from "next/navigation";
import { getWorkflow, workflows } from "@/data";
import { WorkflowDetailClient } from "./WorkflowDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Prerender every workflow detail route at build time.
export function generateStaticParams() {
  return workflows.map((w) => ({ id: w.id }));
}

export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params;
  const workflow = getWorkflow(id);

  if (!workflow) {
    notFound();
  }

  return <WorkflowDetailClient workflow={workflow} />;
}
