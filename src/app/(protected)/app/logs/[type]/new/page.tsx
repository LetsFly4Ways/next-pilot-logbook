import { getPreferences } from "@/actions/user-preferences";
import FlightForm from "@/components/pages/logs/flight-form";
import CenterSpinner from "@/components/ui/center-spinner";
import { getDefaultPreferences } from "@/types/user-preferences";
import { Suspense } from "react";

type Params = Promise<{
  type: "flight" | "simulator";
}>;

async function PageWrapper({ params }: { params: Params }) {
  const { type } = await params;
  const { preferences } = await getPreferences();

  if (type === "flight") {
    return <FlightForm preferences={preferences ?? getDefaultPreferences()} />;
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
