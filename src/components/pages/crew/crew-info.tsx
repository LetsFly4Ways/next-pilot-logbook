import Link from "next/link";

import { fetchCrewMember } from "@/actions/pages/crew/fetch";
import { getPreferences } from "@/actions/user-preferences";

import { formatDate } from "@/lib/date-utils";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorContainer } from "@/components/ui/error-container";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Building,
  ChevronRight,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Plane,
} from "lucide-react";

interface CrewInfoPageProps {
  id: string;
}

export default async function CrewInfoPage({ id }: CrewInfoPageProps) {
  const { crew, error } = await fetchCrewMember(id);
  const prefsResult = await getPreferences();
  const nameDisplay = prefsResult.preferences?.nameDisplay || "first-last";

  if (error || !crew) {
    return (
      <div>
        <PageHeader
          title="Error Loading Crew Member"
          backHref="/app/crew"
          showBackButton
          isTopLevelPage={false}
        />

        <ErrorContainer
          title="Error Loading Crew Member"
          message={error || "Crew Member not found"}
        />
      </div>
    );
  }

  // Format name based on preference
  const fullName =
    nameDisplay === "last-first"
      ? `${crew.last_name}, ${crew.first_name}`.trim()
      : `${crew.first_name} ${crew.last_name}`.trim();

  return (
    <div className="flex flex-col">
      <PageHeader
        title={fullName}
        backHref="/app/crew"
        showBackButton
        isTopLevelPage={false}
        actionButton={
          <Button
            variant="ghost"
            className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
          >
            <Link href={`/app/crew/${id}/edit`}>
              <span>Edit</span>
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        {/* Header Section */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col justify-center">
            <div className="text-md md:text-xl font-bold">{fullName}</div>
            {crew.company && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Building className="w-4 h-4" />
                {crew.company || "-"}
              </div>
            )}
          </div>
        </div>

        <Separator className="w-full my-4" />

        {/* Contact Information Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Contact Information
          </h3>

          {crew.email && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </span>
              <a
                href={`mailto:${crew.email}`}
                className="text-sm text-primary hover:underline"
              >
                {crew.email}
              </a>
            </div>
          )}

          {crew.phone && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </span>
              <a
                href={`tel:${crew.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {crew.phone}
              </a>
            </div>
          )}

          {crew.address && (
            <div className="p-3 flex items-start justify-between gap-4">
              <span className="text-sm font-semibold flex items-center gap-2 shrink-0">
                <MapPin className="w-4 h-4" />
                Address
              </span>
              <span className="text-sm text-right wrap-break-word">
                {crew.address}
              </span>
            </div>
          )}

          {!crew.email && !crew.phone && !crew.address && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No contact information available
            </div>
          )}
        </div>

        <Separator className="w-full my-4" />

        {/* Professional Information Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Professional Information
          </h3>

          {crew.license_number && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                License Number
              </span>
              <span className="text-sm">{crew.license_number}</span>
            </div>
          )}

          {crew.company_id && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company ID
              </span>
              <span className="text-sm">{crew.company_id}</span>
            </div>
          )}

          {!crew.license_number && !crew.company_id && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No professional information available
            </div>
          )}
        </div>

        <Separator className="w-full my-4" />

        {/* Notes Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Notes
          </h3>

          <div className="p-3 flex items-start justify-between gap-4">
            <span className="text-sm font-semibold flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4" />
              Note
            </span>
            <span className="text-sm text-right wrap-break-word whitespace-pre-wrap">
              {crew.note || "-"}
            </span>
          </div>
        </div>

        <Separator className="w-full my-4" />

        {/* Common Flights */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Flights
          </h3>

          <PositionedGroup>
            <PositionedItem
              className="p-3 flex items-center justify-between cursor-pointer"
            //   onClick={() => router.push(`/app/airports/${icao}/departures`)}
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">
                  Flights
                </span>
              </div>

              <div className="flex space-x-2 items-center">
                <span className="text-sm text-muted-foreground">
                  {/* {visits?.departures || 0} */}0
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </PositionedItem>
          </PositionedGroup>
        </div>

        <Separator className="w-full my-4" />

        {/* Metadata Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Metadata
          </h3>

          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Created</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(crew.created_at, "long")}
            </span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Last Updated</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(crew.updated_at, "long")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrewInfoSkeleton() {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col justify-center">
          <Skeleton className="h-7 w-48 mb-2" />
          <div className="flex items-center gap-2 mt-1">
            <Building className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Contact Information Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Contact Information
        </h3>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </span>
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone
          </span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="p-3 flex items-start justify-between gap-4">
          <span className="text-sm font-semibold flex items-center gap-2 shrink-0">
            <MapPin className="w-4 h-4" />
            Address
          </span>
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Professional Information Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Professional Information
        </h3>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <IdCard className="w-4 h-4" />
            License Number
          </span>
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company ID
          </span>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Notes Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Notes
        </h3>

        <div className="p-3 flex items-start justify-between gap-4">
          <span className="text-sm font-semibold flex items-center gap-2 shrink-0">
            <FileText className="w-4 h-4" />
            Note
          </span>
          <div className="flex flex-col gap-2 flex-1 items-end">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Common Flights */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Flights
        </h3>

        <PositionedGroup>
          <PositionedItem
            className="p-3 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              <span className="text-sm font-medium text-foreground">
                Flights
              </span>
            </div>

            <div className="flex space-x-2 items-center">
              <span className="text-sm text-muted-foreground">
                <Skeleton className="h-4 w-10" />
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </PositionedItem>
        </PositionedGroup>
      </div>

      <Separator className="w-full my-4" />

      {/* Metadata Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Metadata
        </h3>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Created</span>
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Last Updated</span>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
