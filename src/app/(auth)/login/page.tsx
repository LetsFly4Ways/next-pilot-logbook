import { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center sm:w-112.5">
      <LoginForm />
    </div>
  );
}
