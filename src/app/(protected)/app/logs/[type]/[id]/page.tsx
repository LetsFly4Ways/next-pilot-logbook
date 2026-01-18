import { Suspense } from "react";

import LogPage from "@/components/pages/logs/view";
import CenterSpinner from "@/components/ui/center-spinner";
import { Metadata } from "next";
import { fetchLog } from "@/actions/pages/logs/fetch";
import { formatDate } from "@/lib/date-utils";

type Params = Promise<{
  id: string;
  type: "flight" | "simulator";
}>;

/* =========================
   Metadata
   ========================= */

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id, type } = await params;

  if (!id) {
    return {
      title: "Log Not Found",
      description: "The requested log could not be found.",
    };
  }

  const { log } = await fetchLog(id);

  if (!log) {
    return {
      title: "Log Not Found",
      description: "The requested log could not be found.",
    };
  }

  return {
    title: formatDate(log.date),
    description: `Information about ${formatDate(log.date)}${type ? ` - ${type}` : ""
      }.`,
  };
}

async function PageWrapper({ params }: { params: Params }) {
  const { id, type } = await params;
  return <LogPage id={id} type={type} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
