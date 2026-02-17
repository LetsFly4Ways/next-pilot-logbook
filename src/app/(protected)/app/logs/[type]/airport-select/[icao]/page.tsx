import { Suspense } from "react";
import { Metadata } from "next";

import AirportSelectDetail from "@/components/pages/logs/select/airport-select-detail";
import CenterSpinner from "@/components/ui/center-spinner";

type Params = Promise<{ type: string; icao: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { icao } = await params;
  return {
    title: `Select ${icao.toUpperCase()}`,
    description: `Select airport and runway`,
  };
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <AirportSelectDetail />
    </Suspense>
  );
}
