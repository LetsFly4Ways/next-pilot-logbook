import { Suspense } from "react";
import { Metadata } from "next";

import { fetchLog } from "@/actions/pages/logs/fetch";

import { formatDate } from "@/lib/date-utils";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorContainer } from "@/components/ui/error-container";
import FlightForm from "@/components/pages/logs/flight-form";
import CenterSpinner from "@/components/ui/center-spinner";
import { getPreferences } from "@/actions/user-preferences";
import { getDefaultPreferences } from "@/types/user-preferences";

type Params = Promise<{
	id: string;
	type: "flight" | "simulator";
}>;

/* ========================= Metadata ========================= */
export async function generateMetadata({
	params,
}: {
	params: Params;
}): Promise<Metadata> {
	const { id, type } = await params;

	if (!id) {
		return {
			title: "Log Not Found",
			description: "The requested log could not be found.",
		};
	}

	const { log } = await fetchLog(id);

	if (!log) {
		return {
			title: "Log Not Found",
			description: "The requested log could not be found.",
		};
	}

	return {
		title: `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`,
		description: `Edit ${formatDate(log.date)}${type ? ` - ${type}` : ""}.`,
	};
}

/* ========================= Page ========================= */

async function EditLogPageContent({ params }: { params: Params }) {
	const { id, type } = await params;
	const { log, error } = await fetchLog(id);
	const { preferences } = await getPreferences();

	if (error || !log) {
		return (
			<div>
				<PageHeader
					title={`Error loading ${type}`}
					backHref={`/app/logs/${id}`}
					showBackButton
					isTopLevelPage={false}
				/>
				<div className="p-6">
					<ErrorContainer
						title={`Error loading ${type}`}
						message={
							error ||
							`${type.charAt(0).toUpperCase() + type.slice(1)} not found.`
						}
					/>
				</div>
			</div>
		);
	}

	return log._type === "flight" ? (
		<FlightForm flight={log} preferences={preferences ?? getDefaultPreferences()} />
	) : (
		// <SimulatorLogInfo session={log} />
		<></>
	);
}

export default function EditLogPage({ params }: { params: Params }) {
	return (
		<Suspense fallback={<CenterSpinner />}>
			<EditLogPageContent params={params} />
		</Suspense>
	);
}
