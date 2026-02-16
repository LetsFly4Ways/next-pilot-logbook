import { Suspense } from "react";
import { Metadata } from "next";

import ApproachSelect from "@/components/pages/logs/select/approach-select";
import CenterSpinner from "@/components/ui/center-spinner";

export const metadata: Metadata = {
  title: "Select approaches",
  description: "Select approaches for the flight",
};

export default function Page() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <ApproachSelect />
    </Suspense>
  );
}
