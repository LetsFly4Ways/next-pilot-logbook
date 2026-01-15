import { Suspense } from "react";
import { Metadata } from "next";

import { fetchCrewMember } from "@/actions/pages/crew/fetch";
import { getPreferences } from "@/actions/user-preferences";

import CrewInfoPage, {
  CrewInfoSkeleton,
} from "@/components/pages/crew/crew-info";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Fetch crew member data for metadata
  const { crew } = await fetchCrewMember(id);
  const prefsResult = await getPreferences();
  const nameDisplay = prefsResult.preferences?.nameDisplay || "first-last";

  if (!crew) {
    return {
      title: "Crew Member Not Found",
      description: "The requested crew member could not be found.",
    };
  }

  // Format name based on preference
  const fullName =
    nameDisplay === "last-first"
      ? `${crew.last_name}, ${crew.first_name}`.trim()
      : `${crew.first_name} ${crew.last_name}`.trim();

  return {
    title: fullName,
    description: `Information about ${fullName}${
      crew.company ? ` - ${crew.company}` : ""
    }.`,
  };
}

async function PageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CrewInfoPage id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CrewInfoSkeleton />}>
      <PageWrapper params={params} />
    </Suspense>
  );
}
