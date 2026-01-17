import { Suspense } from "react";
import { Metadata } from "next";

import { fetchAsset } from "@/actions/pages/fleet/fetch";

import AssetInfoPage, { AssetInfoSkeleton } from "@/components/pages/fleet/asset-info";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Fetch crew member data for metadata
  const { asset } = await fetchAsset(id);

  if (!asset) {
    return {
      title: "Asset Not Found",
      description: "The requested asset could not be found.",
    };
  }

  return {
    title: asset.registration,
    description: `Information about ${asset.registration}${asset.type ? ` - ${asset.type}` : ""
      }.`,
  };
}

async function PageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssetInfoPage id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AssetInfoSkeleton />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
