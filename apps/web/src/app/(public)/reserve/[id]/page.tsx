import ReservationWizard from "@/features/reservation/reservation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReservationWizard propertyId={id} />;
}
