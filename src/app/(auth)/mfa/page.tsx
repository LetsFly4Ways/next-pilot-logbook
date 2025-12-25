import { MfaForm } from "@/components/auth/mfa-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MFA Verification",
  description: "Confirm Your Identity with Multi-Factor Authentication.",
};

export default function MFAPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-112.5">
      <MfaForm />
    </div>
  );
}
