import { Suspense } from "react";

import { fetchStatement } from "@/actions/pages/settings/fetch-statement";

import { PageHeader } from "@/components/layout/page-header";
import CenterSpinner from "@/components/ui/center-spinner";

import ReactMarkdown from "react-markdown";
import { MarkdownComponents } from "@/lib/markdown";


async function PrivacyContent() {
  const file = await fetchStatement("privacy.md");

  if (!file) {
    return (
      <p className="text-center text-muted-foreground">
        Privacy statement not found.
      </p>
    );
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown components={MarkdownComponents}>
        {file}
      </ReactMarkdown>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Privacy Statement"
        backHref="/app/settings"
        showBackButton={true}
        isTopLevelPage={false}
      />

      <div className="p-4 md:p-6">
        <Suspense fallback={<CenterSpinner />}>
          <PrivacyContent />
        </Suspense>
      </div>
    </div>
  )
}