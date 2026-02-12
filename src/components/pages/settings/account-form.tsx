"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { logout } from "@/actions/auth/logout";
import { getAccountData } from "@/actions/pages/settings/account";
import { UserInfoForm } from "@/types/account";
import { User } from "@supabase/supabase-js";
import { TextField } from "@/components/ui/form-field-types";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { canChangePassword } from "@/lib/verify-auth-provider";
import { useRouter } from "next/navigation";

interface AccountFormProps {
  authUser: User | null;
  authLoading: boolean;
}

export function AccountForm({ authUser, authLoading }: AccountFormProps) {
  const router = useRouter();
  const { reset } = useFormContext<UserInfoForm>();
  const [dbLoading, setDbLoading] = useState(true);
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Stop the loop: only run if we have a user and haven't hydrated yet
    if (authLoading || !authUser || hasHydrated.current) return;

    async function load() {
      try {
        const { profile } = await getAccountData();
        reset({
          first_name: profile?.first_name || authUser?.user_metadata?.first_name || "",
          last_name: profile?.last_name || authUser?.user_metadata?.last_name || "",
          email: authUser?.email || "",
          phone: profile?.phone || "",
          company: profile?.company || "",
          company_id: profile?.company_id || "",
          license_number: profile?.license_number || "",
        });
        hasHydrated.current = true;
      } catch (error) {
        console.error(error);
      } finally {
        setDbLoading(false);
      }
    }
    load();
    // Dependency on ID (string) is stable and won't trigger the loop
  }, [reset, authUser?.id, authLoading, authUser]);

  if (dbLoading) return <AccountFormSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Name Section */}
      <div>
        <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Name</h3>
        <PositionedGroup>
          <TextField<UserInfoForm> name="first_name" label="First Name" required />
          <TextField<UserInfoForm> name="last_name" label="Last Name" required />
        </PositionedGroup>
      </div>

      {/* Contact Section */}
      <div>
        <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Contact</h3>
        <PositionedGroup>
          <TextField<UserInfoForm> name="email" label="Email" disabled />
          <TextField<UserInfoForm> name="phone" label="Phone" type="tel" />
        </PositionedGroup>
      </div>

      {/* Professional Section */}
      <div>
        <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Professional</h3>
        <PositionedGroup>
          <TextField<UserInfoForm> name="company" label="Company" />
          <TextField<UserInfoForm> name="company_id" label="Company ID" />
          <TextField<UserInfoForm> name="license_number" label="License Number" />
        </PositionedGroup>
      </div>

      <div className="space-y-4">
        {canChangePassword(authUser) && (
          <PositionedGroup>
            <PositionedItem
              className="p-3 text-center text-sm font-medium text-blue-500 cursor-pointer"
              onClick={() => router.push("/app/settings/account/change-password")}
            >
              Change Password
            </PositionedItem>
          </PositionedGroup>
        )}

        < PositionedGroup >
          <PositionedItem
            className="p-3 text-center text-sm font-medium text-red-500 cursor-pointer"
            onClick={() => logout()}
          >
            Log Out
          </PositionedItem>
        </PositionedGroup>
      </div>
    </div >
  );
}

export function AccountFormSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((section) => (
        <div key={section}>
          {/* Section Header Placeholder */}
          <Skeleton className="h-3 w-24 mb-3 uppercase" />

          <PositionedGroup>
            {[1, 2].map((item) => (
              <PositionedItem key={item} className="p-3 flex items-center gap-4">
                {/* Label Placeholder */}
                <Skeleton className="h-5 w-24 md:w-48" />
                {/* Input Placeholder */}
                <Skeleton className="h-5 flex-1" />
              </PositionedItem>
            ))}
          </PositionedGroup>
        </div>
      ))}

      {/* Action Button Placeholders */}
      <div className="space-y-4">
        <PositionedGroup>
          <PositionedItem className="p-3">
            <Skeleton className="h-5 w-32 mx-auto" />
          </PositionedItem>
        </PositionedGroup>
        <PositionedGroup>
          <PositionedItem className="p-3">
            <Skeleton className="h-5 w-20 mx-auto" />
          </PositionedItem>
        </PositionedGroup>
      </div>
    </div>
  );
}