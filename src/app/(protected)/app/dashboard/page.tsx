import Dashboard from "@/components/pages/dashboard/dashboard";
import CenterSpinner from "@/components/ui/center-spinner";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <Dashboard />
    </Suspense>
  );
}