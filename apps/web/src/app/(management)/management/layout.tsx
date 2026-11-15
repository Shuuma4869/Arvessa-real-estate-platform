import { WorkspaceShell } from "@/components/workspace-shell";
export const metadata = { title: "Management Workspace" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell scope="management">{children}</WorkspaceShell>;
}
