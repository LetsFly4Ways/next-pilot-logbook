"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import UserProfile from "@/components/pages/settings/user-profile";
import { ThemeSelect } from "@/components/pages/settings/theme-select";
import { VersionDisplay } from "@/components/pages/settings/version-display";

import { ChevronRight, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Settings"
        backHref="/"
        showBackButton={false}
        isTopLevelPage={true}
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Profile */}
        <PositionedGroup>
          <PositionedItem
            className="p-3 flex items-center gap-2 justify-between cursor-pointer h-fit"
            onClick={() => router.push("/app/settings/account")}
          >
            <UserProfile />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </PositionedItem>
        </PositionedGroup>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Application
          </h3>

          <PositionedGroup>
            <ThemeSelect />

            <PositionedItem
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/app/settings/release-notes")}
            >
              <span className="text-sm font-medium text-foreground">
                Release Notes
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </PositionedItem>

            <VersionDisplay />
          </PositionedGroup>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Preferences
          </h3>
          <PositionedGroup>
            <PositionedItem
              className="p-3 flex items-center gap-2 justify-between cursor-pointer h-fit"
              onClick={() => router.push("/app/settings/preferences")}
            >
              <span className="text-sm font-medium text-foreground">Preferences</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </PositionedItem>
          </PositionedGroup>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Support
          </h3>
          <PositionedGroup>
            <Link href={"/faq"} target="_blank">
              <PositionedItem
                className="p-3 flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm font-medium text-foreground">FAQ</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </PositionedItem>
            </Link>

            <Link href={"https://github.com/LetsFly4Ways/next-pilot-logbook/issues/new?template=bug_report.md"} target="_blank">
              <PositionedItem
                className="p-3 flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm font-medium text-foreground">
                  Report a bug
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </PositionedItem>
            </Link>

            <Link href={"https://github.com/LetsFly4Ways/next-pilot-logbook/issues/new?template=feature_request.md"} target="_blank">
              <PositionedItem
                className="p-3 flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm font-medium text-foreground">
                  Request a feature
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </PositionedItem>
            </Link>
          </PositionedGroup>
        </div>

        {/* Regulatory */}

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Legal & Regulatory
          </h3>
          <PositionedGroup>
            <PositionedItem
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/app/settings/license")}
            >
              <span className="text-sm font-medium text-foreground">
                License
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </PositionedItem>

            <PositionedItem
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/app/settings/privacy")}
            >
              <span className="text-sm font-medium text-foreground">
                Privacy Statement
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </PositionedItem>

            <PositionedItem
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/app/settings/terms")}
            >
              <span className="text-sm font-medium text-foreground">
                Terms Of Service
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </PositionedItem>
          </PositionedGroup>
        </div>
      </div>
    </div>
  );
}