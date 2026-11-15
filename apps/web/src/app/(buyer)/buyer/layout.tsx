import { WorkspaceShell } from "@/components/workspace-shell";
export const metadata = { title: "Buyer Workspace" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell scope="buyer">{children}</WorkspaceShell>;
}
