import { PageHeader } from "@/components/layout/page-header";
import { AircraftTypeList } from "@/components/pages/fleet/type-select/list";

export const metadata = {
  title: "Select Type",
  description: "Select an aircraft type to continue.",
};


export default function SelectAircraftTypePage() {

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Select Aircraft Type"
        backHref="/app/fleet/new"
        showBackButton
        isTopLevelPage={false}
      />
      <AircraftTypeList />
    </div>
  );
}
