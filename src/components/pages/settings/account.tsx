"use client";

import { useState } from "react";

import { useForm, FormProvider } from "react-hook-form";

import { updateAccount } from "@/actions/pages/settings/account";

import { UserInfoForm } from "@/types/account";

import { useAuth } from "@/components/context/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AccountForm, AccountFormSkeleton } from "@/components/pages/settings/account-form";
import { UserProfile, UserProfileSkeleton } from "@/components/pages/settings/user-profile-editable";
import { Spinner } from "@/components/ui/spinner";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize the form here so we can access it in the Header
  const form = useForm<UserInfoForm>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      company_id: "",
      license_number: ""
    }
  });

  // The submit handler
  const onSave = async (data: UserInfoForm) => {
    setIsSaving(true);
    try {
      await updateAccount(data);
      form.reset(data); // Clear the 'dirty' state
      // Optional: notify profile to update
      window.dispatchEvent(new CustomEvent("user-profile-updated"));
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Account" backHref="/app/settings" showBackButton />
        <div className="p-4 md:p-6 space-y-4">
          <UserProfileSkeleton />
          <AccountFormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Account"
        backHref="/app/settings"
        showBackButton
        actionButton={
          form.formState.isDirty ? (
            <Button
              variant="ghost"
              className="w-10 h-10"
              disabled={isSaving}
              onClick={form.handleSubmit(onSave)} // <--- TRIGGER SUBMIT
            >
              {isSaving ? <Spinner /> : "Save"}
            </Button>
          ) : <div className="w-10 h-10" />
        }
      />
      <div className="p-4 md:p-6 space-y-4">
        <UserProfile authUser={user} />

        <FormProvider {...form}>
          <AccountForm authUser={user} authLoading={authLoading} />
        </FormProvider>
      </div>
    </div>
  );
}