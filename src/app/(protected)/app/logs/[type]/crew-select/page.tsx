import { Suspense } from "react";
import { Metadata } from "next";

import CrewSelect from "@/components/pages/logs/select/crew-select";
import CenterSpinner from "@/components/ui/center-spinner";

type Params = Promise<{ type: "flight" | "simulator" }>;

export const metadata: Metadata = {
  title: "Select PIC",
  description: "Select pilot in command for the flight",
};

async function PageWrapper({ params }: { params: Params }) {
  const { type } = await params;
  return <CrewSelect logType={type} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
