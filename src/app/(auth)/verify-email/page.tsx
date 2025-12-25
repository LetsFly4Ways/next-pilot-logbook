import { Metadata } from "next";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address.",
};

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center sm:w-112.5">
      <VerifyEmailForm />
    </div>
  );
}
