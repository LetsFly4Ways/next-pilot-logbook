import { Suspense } from "react";

import LogPage from "@/components/pages/logs/view";

// Next.js metadata

async function PageWrapper({ params }: { params: Promise<{ id: string; type: "flight" | "simulator" }> }) {
  const { id, type } = await params;
  return <LogPage id={id} type={type} />;
}

export default function Page({ params }: { params: Promise<{ id: string; type: "flight" | "simulator" }> }) {
  return (
    <Suspense fallback={
      // <AssetInfoSkeleton />    
      <div>Loading...</div>
    }>
      <PageWrapper params={params} />
    </Suspense>
  );
}
