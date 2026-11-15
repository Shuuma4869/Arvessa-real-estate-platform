import { WorkspaceShell } from "@/components/workspace-shell";
export const metadata = { title: "Crm Workspace" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell scope="crm">{children}</WorkspaceShell>;
}
