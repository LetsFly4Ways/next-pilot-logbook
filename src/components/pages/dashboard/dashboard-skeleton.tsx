import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 mx-auto w-full animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-80 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}
