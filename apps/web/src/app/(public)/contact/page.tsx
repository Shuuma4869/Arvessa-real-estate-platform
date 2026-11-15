import { Suspense } from "react";
import { Contact } from "@/features/marketing/public-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Contact />
    </Suspense>
  );
}
