import { Suspense } from "react";
import { Journal } from "@/features/marketing/public-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Journal />
    </Suspense>
  );
}
