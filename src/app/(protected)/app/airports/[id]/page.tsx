import { Suspense } from "react";
import AirportPage from "@/components/pages/airports/airport";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airports",
  description: "Browse and search airports",
};

async function AirportPageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AirportPage id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-6">Loading airport...</div>}>
      <AirportPageWrapper params={params} />
    </Suspense>
  );
}
