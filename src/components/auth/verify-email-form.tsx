"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { sendVerificationEmail } from "@/actions/auth/verfication-email";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { Check } from "lucide-react";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("user")?.replace(/"/g, "");

  const [error, setError] = useState<string | undefined>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // cooldown in seconds: initial 30s before first send, 60s between sends
  const [cooldown, setCooldown] = useState<number>(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResendEmail = () => {
    if (cooldown > 0) return;
    setError("");

    startTransition(() => {
      sendVerificationEmail({ email: email! }).then((result) => {
        if (result.error) {
          setError(result.error);
        }
        if (result.success) {
          setIsSuccess(true);

          setTimeout(() => {
            setIsSuccess(false);
            setCooldown(60);
          }, 2000);
        }
      });
    });
  };

  return (
    <CardWrapper
      header="Verify Email"
      headerLabel="Please check your email to verify your account"
      backButtonLabel="Back to Login"
      backButtonHref="/login"
    >
      <div className="flex flex-col gap-6">
        <p className="text-justify">
          We&#39;ve sent you an email with a verification link to <b>{email}</b>
          . Please check your inbox and click the link to verify your account.
        </p>

        <p className="text-justify">
          Didn&#39;t receive the email? Check your spam folder or resend the
          email by clicking the button below.
        </p>

        {error && <FormError message={error} />}

        <Button
          disabled={cooldown > 0 || isPending || isSuccess}
          className={`w-full font-semibold cursor-pointer transition-colors ${
            isSuccess
              ? "opacity-100 bg-green-500 text-white hover:bg-green-600"
              : "bg-accent text-white hover:bg-secondary-hover hover:text-muted-foreground"
          }`}
          size="lg"
          onClick={() => handleResendEmail()}
        >
          {isPending ? (
            <Spinner />
          ) : isSuccess ? (
            <Check />
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            "Send Verification Email"
          )}
        </Button>
      </div>
    </CardWrapper>
  );
}
