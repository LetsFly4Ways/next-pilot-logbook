"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { changePassword } from "@/actions/auth/change-password";

import { cn } from "@/lib/utils";
import { canChangePassword } from "@/lib/verify-auth-provider";

import { ChangePasswordForm, ChangePasswordFormSchema } from "@/types/auth/change-password";

import { useAuth } from "@/components/context/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PasswordField, TextField } from "@/components/ui/form-field-types";
import { PositionedGroup } from "@/components/ui/positioned-group";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  // Redirect social users if they try to access this URL directly
  useEffect(() => {
    if (!authLoading && user && !canChangePassword(user)) {
      router.replace("/app/settings/account");
    }
  }, [user, authLoading, router]);

  const onSubmit = async (values: ChangePasswordForm) => {
    setIsPending(true);
    setStatus(null);

    const result = await changePassword(values);

    if (result.error) {
      setStatus({ type: "error", msg: result.error });
      setIsPending(false);
    } else {
      setStatus({ type: "success", msg: "Password updated! Redirecting..." });
      setTimeout(() => {
        router.push("/app/settings/account");
      }, 2000);
    }
  };

  if (authLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Change Password"
        backHref="/app/settings/account"
        showBackButton
        actionButton={
          <Button
            type="submit"
            variant="ghost"
            className="w-10 h-10"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? <Spinner /> : "Save"}
          </Button>
        }
      />

      <main className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-bold text-2xl">Change Password</h1>
          <p className="text-sm text-muted-foreground">
            Update your account password to keep your profile secure.
          </p>
        </div>

        <FormProvider {...form}>
          <div className="space-y-6">
            <PositionedGroup>
              <PasswordField<ChangePasswordForm>
                name="current_password"
                label="Current Password"
                required
              />
            </PositionedGroup>

            <PositionedGroup>
              <PasswordField<ChangePasswordForm>
                name="new_password"
                label="New Password"
                required
              />
              <PasswordField<ChangePasswordForm>
                name="confirm_new_password"
                label="Confirm New Password"
                required
              />
            </PositionedGroup>

            {status && (
              <div className={cn(
                "p-4 rounded-lg flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2",
                status.type === "error" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
              )}>
                {status.type === "error" ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
                {status.msg}
              </div>
            )}
          </div>
        </FormProvider>
      </main>
    </div >
  );
}