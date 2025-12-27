"use client";

import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResetFormSchema } from "@/types/auth/reset";
import { resetPassword } from "@/actions/auth/reset";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { EmailInput } from "@/components/auth/email-input";
import { FormError } from "@/components/auth/form-error";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ResetForm() {
  const [error, setError] = useState<string | undefined>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetFormSchema>>({
    resolver: zodResolver(ResetFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetFormSchema>) => {
    setError("");

    startTransition(() => {
      resetPassword(values).then((result) => {
        if (result.error) {
          setError(result.error);
        }
        if (result.success) {
          setIsSuccess(true);
          // Add a delay to ensure state updates complete
          setTimeout(() => {
            redirect(result.redirectTo);
          }, 1500);
        }
      });
    });
  };

  return (
    <CardWrapper
      header="Reset Password"
      headerLabel="Please enter your email to reset your password"
      backButtonLabel="Found your password?"
      backButtonHref="/login"
      showTerms
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="gap-4">
            <EmailInput
              name="email"
              placeholder="name@email.com"
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
            {isPending ? <Spinner /> : isSuccess ? "Sent!" : "Send Reset Email"}
          </Button>
        </form>
      </FormProvider>
    </CardWrapper>
  );
}
