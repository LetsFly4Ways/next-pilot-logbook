import Link from "next/link";

import { CopyrightYear } from "@/components/pages/landing/copyright-year";

import { ChevronsRight } from "lucide-react";

export default function LegalLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-muted py-8">
        <div className="container max-w-4xl flex items-center justify-between px-4">
          <Link href="/" className="flex gap-2 items-center flex-1">
            <div className="relative h-9 w-9 overflow-hidden rounded-md bg-primary dark:bg-secondary flex items-center justify-center">
              <ChevronsRight className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block">NEXT Pilot Logbook</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Document Title Section */}
      <main className="container max-w-4xl py-16 px-4">
        {/* The Markdown Content */}
        <div className="">
          {children}
        </div>

        {/* Footer for Legal Pages */}
        <footer className="mt-16 pt-8 border-t border-muted text-center">
          <p className="text-sm text-muted-foreground">
            © <CopyrightYear /> NEXT Pilot Logbook. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}