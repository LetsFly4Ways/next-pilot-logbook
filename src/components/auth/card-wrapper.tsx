"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { SSOButtons } from "@/components/auth/social-auth";
import { BackButton } from "@/components/auth/back-button";
import { HeaderLabel } from "@/components/auth/header-label";
import { FieldSeparator } from "../ui/field";
import Link from "next/link";

interface CardWrapperProps {
  children: React.ReactNode;
  header: string;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  showTerms?: boolean;
}

export const CardWrapper = ({
  children,
  header,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  showTerms,
}: CardWrapperProps) => {
  return (
    <Card className="w-full h-full outline-none border-none shadow-none">
      <CardHeader>
        <Header label={header} />
        <HeaderLabel label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <>
          <FieldSeparator className="mx-6">OR</FieldSeparator>
          <CardFooter>
            <SSOButtons />
          </CardFooter>
        </>
      )}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
      {showTerms && (
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
