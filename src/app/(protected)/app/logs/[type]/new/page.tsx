import { Suspense } from "react";

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPreferences } from "@/actions/user-preferences";

import { getDefaultPreferences } from "@/types/user-preferences";

import FlightForm from "@/components/pages/logs/form/flight-form";
import SimulatorForm from "@/components/pages/logs/form/simulator-form";
import CenterSpinner from "@/components/ui/center-spinner";


type Params = Promise<{
  type: "flight" | "simulator";
}>;

/* ========================= Metadata ========================= */

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type } = await params;

  if (!type) {
    return {
      title: "Log form type not found",
      description: "The requested log form type could not be found.",
    };
  }

  return {
    title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Log`,
    description: `Create a new ${type} log entry.`,
  };
}

/* ========================= Page ========================= */

async function PageWrapper({ params }: { params: Params }) {
  const { type } = await params;
  const { preferences } = await getPreferences();

  if (type === "flight") {
    return <FlightForm preferences={preferences ?? getDefaultPreferences()} />;
  } else if (type === "simulator") {
    return <SimulatorForm preferences={preferences ?? getDefaultPreferences()} />;
  } else {
    notFound();
  }
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
