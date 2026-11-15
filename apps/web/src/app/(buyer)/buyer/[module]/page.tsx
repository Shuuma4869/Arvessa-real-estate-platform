import WorkspacePage from "@/features/workspace-page";
import { notFound } from "next/navigation";
import { moduleNames } from "@/domain/permissions";
export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!moduleNames[module]) notFound();
  return <WorkspacePage scope="buyer" module={module} />;
}
