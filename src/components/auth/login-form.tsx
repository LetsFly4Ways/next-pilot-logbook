"use client";

import { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginFormSchema } from "@/types/auth/login";
import { login } from "@/actions/auth/login";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { PasswordInput } from "@/components/auth/password-input";
import { EmailInput } from "@/components/auth/email-input";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginFormSchema>) => {
    setError("");
    startTransition(async () => {
      try {
        login(values).then((result) => {
          if (result.error) {
            setError(result.error);
            return;
          }

          if (result.success) {
            redirect(result.redirectTo);
          }
        });
      } catch (error) {
        setError("An error occurred" + error);
      }
    });
  };

  return (
    <CardWrapper
      header="Login"
      headerLabel="Please enter your details below to continue"
      backButtonLabel="Don't have an account?"
      backButtonHref="/register"
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
            <div className="flex flex-col gap-1">
              <PasswordInput
                name="password"
                placeholder="Password"
                disabled={isPending}
              />
              <Button
                size="sm"
                variant="link"
                asChild
                className="px-0 justify-start font-normal text-xs text-muted-foreground hover:text-primary"
              >
                <Link href="/reset-password">Forgot password?</Link>
              </Button>
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
            {isPending ? <Spinner /> : "Login"}
          </Button>
        </form>
      </FormProvider>
    </CardWrapper>
  );
}
