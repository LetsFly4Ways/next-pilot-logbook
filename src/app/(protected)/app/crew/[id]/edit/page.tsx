import { fetchCrewMember } from "@/actions/pages/crew/fetch";
import { PageHeader } from "@/components/layout/page-header";
import CrewForm from "@/components/pages/crew/form";
import { ErrorContainer } from "@/components/ui/error-container";

export const metadata = {
  title: "Update Crew",
  description: "Update your crew member information.",
};

export default async function EditCrewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { crew, error } = await fetchCrewMember(id);

  if (error || !crew) {
    return (
      <div>
        <PageHeader
          title="Error loading crew member"
          backHref="/app/crew"
          showBackButton
          isTopLevelPage={false}
        />
        <ErrorContainer
          title="Error loading crew member"
          message={error || "No crew member found."}
        />
      </div>
    );
  }

  return <CrewForm crew={crew} />;
}
