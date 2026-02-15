import { Suspense } from "react";

import { PrivacyContent } from "@/components/pages/settings/privacy";
import CenterSpinner from "@/components/ui/center-spinner";

export default async function PrivacyPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PrivacyContent />
    </Suspense>
  );
}