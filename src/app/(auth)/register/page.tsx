import { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your personalised account today!",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-centersm:w-112.5">
      <RegisterForm />
    </div>
  );
}
