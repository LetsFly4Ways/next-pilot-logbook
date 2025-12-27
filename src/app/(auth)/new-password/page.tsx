import { Suspense } from "react";
import { Metadata } from "next";

import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = {
  title: "New Password",
  description: "Set a new password for your account.",
};

export default function NewPasswordPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center sm:w-112.5">
      <Suspense>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
