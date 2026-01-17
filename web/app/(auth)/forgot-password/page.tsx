import { Suspense } from "react";
import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page";

export default function Page() {
  return (
    <Suspense>
      <ForgotPasswordPage />
    </Suspense>
  );
}
