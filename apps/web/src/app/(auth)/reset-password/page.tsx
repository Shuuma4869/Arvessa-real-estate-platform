import { Suspense } from "react";
import AuthScreen from "@/features/auth/auth-screen";
import { Loading } from "@/components/ui";
export const metadata = { title: "Tài khoản demo" };
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthScreen mode="reset-password" />
    </Suspense>
  );
}
