import FlightForm from "@/components/pages/logs/flight-form";
import CenterSpinner from "@/components/ui/center-spinner";
import { Suspense } from "react";

type Params = Promise<{
  type: "flight" | "simulator";
}>;

async function PageWrapper({ params }: { params: Params }) {
  const { type } = await params;

  if (type === "flight") {
    return <FlightForm />;
  } else {
    // <SimulatorForm />
    return <></>
  }
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
