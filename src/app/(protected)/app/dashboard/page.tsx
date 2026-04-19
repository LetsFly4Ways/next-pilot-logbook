import { Suspense } from "react";

import { DashboardFilter } from "@/types/statistics";

import Dashboard from "@/components/pages/dashboard/dashboard";
import CenterSpinner from "@/components/ui/center-spinner";

export const metadata = {
  title: "Dashboard",
  description: "Your experience at a glance: insights, trends, and stats from your flights.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = (params.filter as DashboardFilter) || "all";

  return (
    <Suspense fallback={<CenterSpinner />}>
      <Dashboard filter={filter} />
    </Suspense>
  );
}