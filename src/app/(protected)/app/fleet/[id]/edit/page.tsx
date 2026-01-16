import { fetchAsset } from "@/actions/pages/fleet/fetch";

import { PageHeader } from "@/components/layout/page-header";
import FleetForm from "@/components/pages/fleet/form";
import { ErrorContainer } from "@/components/ui/error-container";

export const metadata = {
  title: "Update Fleet",
  description: "Update your fleet asset information.",
};

export default async function EditFleetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { asset, error } = await fetchAsset(id);

  if (error || !asset) {
    return (
      <div>
        <PageHeader
          title="Error loading asset"
          backHref="/app/crew"
          showBackButton
          isTopLevelPage={false}
        />
        <div className="p-6">
          <ErrorContainer
            title="Error loading fleet asset"
            message={error || "No asset found."}
          />
        </div>
      </div>
    );
  }

  return <FleetForm fleet={asset} />;
}
