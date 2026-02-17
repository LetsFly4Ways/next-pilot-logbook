import { Suspense } from "react";
import { Metadata } from "next";

import AirportSelectList from "@/components/pages/logs/select/airport-select-list";
import CenterSpinner from "@/components/ui/center-spinner";

type Params = Promise<{ type: "flight" | "simulator" }>;

export const metadata: Metadata = {
  title: "Select Airport",
  description: "Select departure or destination airport for the flight",
};

async function PageWrapper({ params }: { params: Params }) {
  const { type } = await params;

  if (type !== "flight") {
    return (
      <div className="p-6 text-muted-foreground">
        Airport select is only available for flights.
      </div>
    );
  }

  return <AirportSelectList />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
