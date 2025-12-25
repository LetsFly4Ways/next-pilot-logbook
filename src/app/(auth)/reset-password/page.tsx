import { Metadata } from "next";

import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Forgot your password? Reset it here.",
};

export default function ResetPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center sm:w-112.5">
      <ResetForm />
    </div>
  );
}
