"use client";

import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { redirect, useSearchParams } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { NewPasswordFormSchema } from "@/types/auth/new-password";
import { newPassword } from "@/actions/auth/new-password";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/auth/form-error";
import { PasswordInput } from "@/components/auth/password-input";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("code");

  const [error, setError] = useState<string | undefined>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordFormSchema>>({
    resolver: zodResolver(NewPasswordFormSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordFormSchema>) => {
    setError("");

    startTransition(() => {
      newPassword(values, token).then((result) => {
        if (result.error) {
          setError(result.error);
        }
        if (result.success) {
          setIsSuccess(true);
          // Add a delay to ensure state updates complete
          setTimeout(() => {
            redirect(result.redirectTo);
          }, 1000);
        }
      });
    });
  };

  return (
    <CardWrapper
      header="Reset Password"
      headerLabel="Please enter a new password for your account"
      backButtonLabel="Found your (old) password?"
      backButtonHref="/login"
      showTerms
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="gap-4">
            <PasswordInput
              name="password"
              placeholder="Password"
              disabled={isPending}
            />
            <PasswordInput
              name="confirm_password"
              placeholder="Confirm Password"
              disabled={isPending}
            />
          </FieldGroup>

          {error && (
            <FieldError>
              <FormError message={error} />
            </FieldError>
          )}

          <Button
            disabled={isPending || isSuccess}
            type="submit"
            className={`w-full font-semibold cursor-pointer transition-colors ${
              isSuccess
                ? "opacity-100 bg-green-500 text-white hover:bg-green-600"
                : "bg-accent text-white hover:bg-accent/80"
            }`}
            size="lg"
          >
            {isPending ? (
              <Spinner />
            ) : isSuccess ? (
              "Success!"
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </FormProvider>
    </CardWrapper>
  );
}
