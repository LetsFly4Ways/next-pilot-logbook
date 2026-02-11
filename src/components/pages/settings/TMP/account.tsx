"use client";

import { useState } from "react";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateAccount } from "@/actions/pages/settings/account";

import { UserInfoForm, UserInfoFormSchema } from "@/types/account";

import { AccountForm } from "@/components/pages/settings/account-form";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorContainer } from "@/components/ui/error-container";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/components/context/auth-provider";
import { UserProfile, UserProfileSkeleton } from "../user-profile-editable";

export function AccountSettingsPage() {
  return <>Test</>
}

export default function AccountSettingsPageTMP() {
  const { user: authUser, loading } = useAuth();
  const [error, setError] = useState("")

  const form = useForm<UserInfoForm>({
    resolver: zodResolver(UserInfoFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      company_id: "",
      license_number: "",
    },
  });

  const { isDirty, isSubmitting } = form.formState;

  const handleSave = async (data: UserInfoForm) => {
    const result = await updateAccount(data);
    if (result.success) {
      form.reset(data); // Clear dirty state
      window.dispatchEvent(new CustomEvent("user-profile-updated"));
    } else {
      setError(`Failed to update account: ${result.error}`)
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Account" backHref="/app/settings" showBackButton />
        <AccountPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Account"
        backHref="/app/settings"
        showBackButton={true}
        isTopLevelPage={false}
        actionButton={
          isDirty ? (
            <Button
              variant="ghost"
              onClick={form.handleSubmit(handleSave)}
              disabled={isSubmitting}
            >
              <div className="flex justify-center">
                {isSubmitting ? <Spinner className="mx-2.5" /> : "Save"}

              </div>
            </Button>
          ) : <div className="w-10" />
        }
      />

      {error && (
        <ErrorContainer title="Error In Your Account" message={error} />
      )}

      <div className="p-4 md:p-6 space-y-4">
        <UserProfile authUser={authUser} />

        <FormProvider {...form}>
          <AccountForm authUser={authUser} authLoading={loading} />
        </FormProvider>
      </div>
    </div>
  );
}

function AccountPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <UserProfileSkeleton />
      <AccountPageSkeleton />
    </div>
  )
}