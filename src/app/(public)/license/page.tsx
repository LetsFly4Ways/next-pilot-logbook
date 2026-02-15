import { Suspense } from "react";

import { LicenseContent } from "@/components/pages/settings/license";
import CenterSpinner from "@/components/ui/center-spinner";

export default async function LicensePage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <LicenseContent />
    </Suspense>
  );
}