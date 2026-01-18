import Link from "next/link";

import { fetchAsset } from "@/actions/pages/fleet/fetch";

import { formatDate } from "@/lib/date-utils";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorContainer } from "@/components/ui/error-container";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { Building, ChevronRight, FileText, Notebook, Plane, Square } from "lucide-react";
import { PiEngine, PiSeat } from "react-icons/pi";

interface AssetInfoPageProps {
  id: string;
}

export default async function AssetInfoPage({ id }: AssetInfoPageProps) {
  const { asset, error } = await fetchAsset(id);

  if (error || !asset) {
    return (
      <div>
        <PageHeader
          title="Error Loading Asset"
          backHref="/app/fleet"
          showBackButton
          isTopLevelPage={false}
        />

        <ErrorContainer
          title="Error Loading Asset"
          message={error || "Asset not found"}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={asset.registration}
        backHref="/app/fleet"
        showBackButton
        isTopLevelPage={false}
        actionButton={
          <Button
            variant="ghost"
            className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
          >
            <Link href={`/app/fleet/${id}/edit`}>
              <span>Edit</span>
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        {/* Header Section */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col justify-center">
            <div className="text-md md:text-xl font-bold">{asset.registration}</div>
            {asset.operator && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1 capitalize">
                <Building className="w-4 h-4" />
                {asset.operator || "-"}
              </div>
            )}
          </div>
        </div>

        <Separator className="w-full my-4" />

        {/* Aircraft/Simulator Specific Information Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            {asset.is_simulator ? ("Simulator") : ("Aircraft")} Information
          </h3>

          {asset.type && !asset.model && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Type
              </span>
              {asset.type || "-"}
            </div>
          )}

          {asset.model && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Type
              </span>
              {asset.model || "-"} {asset.type && (`(${asset.type})`)}
            </div>
          )}

          {asset.manufacturer && (
            <div className="p-3 flex items-center justify-between capitalize">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Building className="w-4 h-4" />
                Manufacturer
              </span>
              {asset.manufacturer || "-"}
            </div>
          )}

          {!asset.type && !asset.model && !asset.manufacturer && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              {`No ${asset.is_simulator ? "simulator" : "aircraft"} information available`}
            </div>
          )}
        </div>

        <Separator className="w-full my-4" />

        {/* Additional Information Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Additional Information
          </h3>

          {asset.category && (
            <div className="p-3 flex items-center justify-between capitalize">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Square className="w-4 h-4" />
                Category
              </span>
              {asset.category || "-"}
            </div>
          )}

          {asset.engine_count && !asset.engine_type && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <PiEngine className="w-4 h-4" />
                Powerplant
              </span>
              {asset.engine_count || "-"}
            </div>
          )}


          {asset.engine_type && (
            <div className="p-3 flex items-center justify-between capitalize">
              <span className="text-sm font-semibold flex items-center gap-2">
                <PiEngine className="w-4 h-4" />
                Powerplant
              </span>
              {asset.engine_type || "-"} {asset.engine_count && (`(${asset.engine_count})`)}
            </div>
          )}

          {asset.passenger_seats > 0 && (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <PiSeat className="w-4 h-4" />
                Passenger Seats
              </span>
              {asset.passenger_seats || "-"}
            </div>
          )}

          {!asset.category && !asset.engine_count && !asset.engine_type && !asset.passenger_seats && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              {`No ${asset.is_simulator ? "simulator" : "aircraft"} information available`}
            </div>
          )}
        </div>

        <Separator className="w-full my-4" />

        {/* Notes Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Notes
          </h3>

          {asset.status && (
            <div className="p-3 flex items-center justify-between capitalize">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Notebook className="w-4 h-4" />
                Status
              </span>
              {asset.status || "-"}
            </div>
          )}

          <div className="p-3 flex items-start justify-between gap-4">
            <span className="text-sm font-semibold flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4" />
              Note
            </span>
            <span className="text-sm text-right wrap-break-word whitespace-pre-wrap">
              {asset.note || "-"}
            </span>
          </div>
        </div>

        <Separator className="w-full my-4" />

        {/* Common Flights */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            {asset.is_simulator ? "Simulator Sessions" : "Flights"}
          </h3>

          <PositionedGroup>
            <PositionedItem
              className="p-3 flex items-center justify-between cursor-pointer"
            //   onClick={() => router.push(`/app/airports/${icao}/departures`)}
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">
                  {asset.is_simulator ? "Simulator Sessions" : "Flights"}
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
              {formatDate(asset.created_at, "long")}

            </span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Last Updated</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(asset.updated_at, "long")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssetInfoSkeleton() {
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

      {/* Aircraft/Simulator Specific Information Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          <Skeleton className="h-4 w-12" /> Information
        </h3>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Type
          </span>
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="p-3 flex items-center justify-between capitalize">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Building className="w-4 h-4" />
            Manufacturer
          </span>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Professional Information Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Additional Information
        </h3>

        <div className="p-3 flex items-center justify-between capitalize">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Square className="w-4 h-4" />
            Category
          </span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="p-3 flex items-center justify-between capitalize">
          <span className="text-sm font-semibold flex items-center gap-2">
            <PiEngine className="w-4 h-4" />
            Powerplant
          </span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <PiSeat className="w-4 h-4" />
            Passenger Seats
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

        <div className="p-3 flex items-center justify-between capitalize">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Notebook className="w-4 h-4" />
            Status
          </span>
          <Skeleton className="h-4 w-32" />

        </div>

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
  )
}