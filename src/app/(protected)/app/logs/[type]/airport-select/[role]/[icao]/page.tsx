import { Suspense } from "react";
import { Metadata } from "next";

import AirportSelectDetail from "@/components/pages/logs/select/airport-select-detail";
import CenterSpinner from "@/components/ui/center-spinner";

export const metadata: Metadata = {
  title: "Airport Details",
  description: "Choose runway or select this airport",
};

// params: { type, role, icao }

type Params = Promise<{
  type: "flight" | "simulator";
  role: "departure" | "destination";
  icao: string;
}>;

async function PageWrapper({ params }: { params: Params }) {
  const { type, role, icao } = await params;

  if (type !== "flight") {
    // fallback component could also accept role but not needed for now
    return <AirportSelectDetail params={{ type, icao }} />;
  }

  return <AirportSelectDetail params={{ type, role, icao }} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
