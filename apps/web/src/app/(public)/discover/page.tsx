import { Suspense } from "react";
import Discovery from "@/features/discovery/discovery";
import { Loading } from "@/components/ui";
export const metadata = { title: "Bộ sưu tập" };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Discovery />
    </Suspense>
  );
}
