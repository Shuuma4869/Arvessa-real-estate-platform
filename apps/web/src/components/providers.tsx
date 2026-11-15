"use client";
import { useEffect, type ReactNode } from "react";
import { useDemo } from "@/services/store";
import { Notice } from "./ui";
export default function Providers({ children }: { children: ReactNode }) {
  const init = useDemo((s) => s.initialize),
    p = useDemo((s) => s.data.preferences),
    warning = useDemo((s) => s.storageWarning);
  useEffect(() => init(), [init]);
  return (
    <div
      data-density={p.density}
      data-motion={p.reducedMotion ? "reduced" : "full"}
      data-theme={p.theme}
    >
      {children}
      {warning && (
        <div role="status" className="storage-warning">
          {warning}
        </div>
      )}
      <Notice />
    </div>
  );
}
