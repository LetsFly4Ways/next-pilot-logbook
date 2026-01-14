import { Suspense } from "react";
import type { Metadata } from "next";

import AirportPage from "@/components/pages/airports/airport";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: id.toUpperCase(),
    description: `All you need to know about ${id.toUpperCase()}.`,
  };
}

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
