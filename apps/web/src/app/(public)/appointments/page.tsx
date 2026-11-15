import { Suspense } from "react";
import { PublicAppointment } from "@/features/marketing/public-pages";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PublicAppointment />
    </Suspense>
  );
}
