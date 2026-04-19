import { Suspense } from "react";

import Dashboard from "@/components/pages/dashboard/dashboard";
import CenterSpinner from "@/components/ui/center-spinner";

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
    <Suspense fallback={<CenterSpinner />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}