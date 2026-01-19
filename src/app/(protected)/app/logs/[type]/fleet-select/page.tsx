import { Suspense } from "react";
import { Metadata } from "next";

import FleetSelect from "@/components/pages/logs/select/fleet-select";
import CenterSpinner from "@/components/ui/center-spinner";


type Params = Promise<{
  id: string;
  type: "flight" | "simulator";
}>;

/* ========================= Metadata ========================= */

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type } = await params;

  let title = "";
  if (type === "flight") {
    title = "Select Aircraft";
  } else {
    title = "Select Simulator";
  }

  if (!type) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }

  return {
    title: title,
    description: type ? title : "",
  };
}


/* ========================= Page ========================= */

async function PageWrapper({ params }: { params: Params }) {
  const { id, type } = await params;

  return (
    <FleetSelect logId={id} logType={type} />
  )
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}