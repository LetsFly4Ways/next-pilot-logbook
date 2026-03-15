import { Suspense } from "react";
import { Metadata } from "next";

import AirportSelectList from "@/components/pages/logs/select/airport-select-list";
import CenterSpinner from "@/components/ui/center-spinner";
import AirportSelectFallback from "@/components/pages/logs/select/airport-select-fallback";

// route params: type = flight|simulator, role = departure|destination

export const metadata: Metadata = {
  title: "Select Airport",
  description: "Select departure or destination airport for the flight",
};

type Params = Promise<{ type: "flight" | "simulator"; role: "departure" | "destination" }>;

async function PageWrapper({ params }: { params: Params }) {
  const { type, role } = await params;

  if (type !== "flight") {
    return <AirportSelectFallback type={type} />;
  }

  // pass the role through so the list component can build URLs correctly
  return <AirportSelectList role={role} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
