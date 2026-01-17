import { Suspense } from "react";
import { CredentialsPage } from "@/features/credentials/components/credentials-page";

export default function Page() {
  return (
    <Suspense>
      <CredentialsPage scope="personal" />
    </Suspense>
  );
}
