import { Suspense } from "react";
import { Metadata } from "next";

import CrewSelect from "@/components/pages/logs/select/crew-select";
import CenterSpinner from "@/components/ui/center-spinner";

export const metadata: Metadata = {
  title: "Select PIC",
  description: "Select pilot in command for the flight",
};

export default function Page() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <CrewSelect />
    </Suspense>
  );
}
