"use client";

import { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { redirect } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RegisterFormSchema } from "@/types/auth/register";
import { register } from "@/actions/auth/register";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { EmailInput } from "@/components/auth/email-input";
import { PasswordInput } from "@/components/auth/password-input";
import { FormError } from "@/components/auth/form-error";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RegisterForm() {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterFormSchema>) => {
    setError("");
    startTransition(async () => {
      register(values).then((result) => {
        if (result.error) {
          console.error("Registration error:", result.error);
          setError(result.error);
          return;
        }

        if (result.success) {
          redirect(result.redirectTo);
        }
      });
    });
  };

  return (
    <CardWrapper
      header="Create Account"
      headerLabel="Enter your email below to create your account"
      backButtonLabel="Already have an account?"
      backButtonHref="/login"
      showSocial
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

            <PasswordInput
              name="password"
              placeholder="Password"
              disabled={isPending}
            />

            <div className="flex flex-col gap-1">
              <PasswordInput
                name="confirm_password"
                placeholder="Confirm Password"
                disabled={isPending}
              />
              <p className="h-8 flex items-center text-xs text-muted-foreground">
                Least 6 characters with 1 uppercase letter & 1 number required.
              </p>
            </div>
          </FieldGroup>

          {error && (
            <FieldError>
              <FormError message={error} />
            </FieldError>
          )}

          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-accent text-white hover:bg-accent/80 font-semibold cursor-pointer"
            size="lg"
          >
            {isPending ? <Spinner /> : "Create Account"}
          </Button>
        </form>
      </FormProvider>
    </CardWrapper>
  );
}
