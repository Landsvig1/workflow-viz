import { notFound } from "next/navigation";
import { getWorkflow } from "@/data";
import { WorkflowDetailClient } from "./WorkflowDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params;
  const workflow = getWorkflow(id);

  if (!workflow) {
    notFound();
  }

  return <WorkflowDetailClient workflow={workflow} />;
}
