import { Suspense } from "react";

import Dashboard from "@/components/pages/dashboard/dashboard";
import DashboardSkeleton from "@/components/pages/dashboard/dashboard-skeleton";

export const metadata = {
  title: "Dashboard",
  description: "Your experience at a glance: insights, trends, and stats from your flights.",
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}