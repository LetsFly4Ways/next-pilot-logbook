import { Suspense } from "react";

import { ToSContent } from "@/components/pages/settings/tos";
import CenterSpinner from "@/components/ui/center-spinner";

export default async function ToSPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <ToSContent />
    </Suspense>
  );
}