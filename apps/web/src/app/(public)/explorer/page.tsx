import { Suspense } from "react";
import Explorer from "@/features/spatial/explorer";
import { Loading } from "@/components/ui";
export const metadata = { title: "Khám phá 3D" };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Explorer />
    </Suspense>
  );
}
