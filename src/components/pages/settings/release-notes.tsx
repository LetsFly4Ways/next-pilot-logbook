import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { fetchReleaseNotes } from "@/actions/pages/settings/fetch-release-notes";

interface ReleaseNote {
  version: string;
  date: string;
  description: string;
  changes: {
    added: string[];
    changed: string[];
    fixed: string[];
  };
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-75 space-y-4">
      <Spinner className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading release notes...
      </p>
    </div>
  );
}

function ChangeList({ title, items }: { title: string, items: string[] }) {
  if (items.length === 0) return null;

  // Map variants to subtle colors if your Badge supports it, 
  // or just use text colors for a "Clean" look.
  const dotColors: Record<string, string> = {
    Added: "bg-emerald-500",
    Changed: "bg-blue-500",
    Fixed: "bg-amber-500",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${dotColors[title] || "bg-foreground"}`} />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      <ul className="grid gap-2 ml-3.5">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-foreground/80 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReleaseItem({ release }: { release: ReleaseNote }) {
  return (
    <div className="relative pb-6 last:pb-0" id={release.version}>
      {/* The Timeline Line */}
      <div className="absolute left-0 top-2 -bottom-2 w-px bg-border last:hidden" />

      <div className="pl-8 relative">
        {/* The Timeline Dot */}
        <div className="absolute -left-1 top-2 size-2 rounded-full border bg-background border-muted-foreground/50" />

        <header className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 gap-1">
          <h3 className="font-bold text-xl tracking-tight">Version {release.version}</h3>
          <time className="text-sm font-medium text-muted-foreground">{release.date}</time>
        </header>

        {release.description && (
          <p className="text-muted-foreground mb-6 max-w-2xl">{release.description}</p>
        )}

        <div className="space-y-8">
          <ChangeList title="Added" items={release.changes.added} />
          <ChangeList title="Changed" items={release.changes.changed} />
          <ChangeList title="Fixed" items={release.changes.fixed} />
        </div>
      </div>
    </div>
  );
}

async function ReleaseNotesContent() {
  const releaseNotes = await fetchReleaseNotes();

  if (!releaseNotes || releaseNotes.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">No release notes available.</p>
      </div>
    );
  }

  return (
    // Reduced padding from p-10 to py-8
    <div className="max-w-4xl mx-auto py-8">
      {releaseNotes.map((release) => (
        <ReleaseItem key={release.version} release={release} />
      ))}
    </div>
  );
}

export default function ReleaseNotesPage() {
  return (
    // Removed min-h-screen to let the content dictate the height
    <div className="bg-background">
      <PageHeader
        title="Release Notes"
        backHref="/app/settings/"
        showBackButton={true}
        isTopLevelPage={false}
      />

      {/* Simplified padding on main */}
      <main className="px-6 md:px-12">
        <div className="max-w-4xl mx-auto pt-10 pb-6 border-b">
          <h2 className="text-3xl font-bold tracking-tight mb-2">What&apos;s New</h2>
          <p className="text-muted-foreground text-lg">
            The latest updates, fixes, and improvements.
          </p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <ReleaseNotesContent />
        </Suspense>
      </main>
    </div>
  );
}