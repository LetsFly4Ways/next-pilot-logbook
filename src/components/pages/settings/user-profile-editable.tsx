"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteAvatar, uploadAvatar } from "@/actions/pages/settings/avatar";

import { User } from "@supabase/supabase-js";

import { ProfilePicture } from "@/components/pages/settings/profile-picture";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileProps {
  authUser: User | null; // The User object from Supabase Auth
}

export function UserProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Profile Picture Placeholder (Matching 'xl' size) */}
      <Skeleton className="size-32 rounded-full" />

      {/* Name and Email Placeholders */}
      <div className="space-y-2 flex flex-col items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function UserProfile({ authUser }: UserProfileProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive display values from Supabase Auth metadata
  const displayName = authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.display_name ||
    "Unknown User";

  const email = authUser?.email || "No email available";

  // Get avatar from metadata or fallback to a standard field if your schema differs
  const avatarUrl = authUser?.user_metadata?.avatar_url;

  const notifyChange = () => {
    // This triggers the AuthProvider to refresh the session user object
    window.dispatchEvent(new CustomEvent("user-profile-updated"));
    router.refresh();
  };

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        console.log("Profile picture updated");
        notifyChange();
      } else {
        console.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error(`An unexpected error occurred: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const result = await deleteAvatar();
      if (result.success) {
        console.log("Profile picture removed");
        notifyChange();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <ProfilePicture
        src={avatarUrl}
        alt={displayName}
        size="xl"
        onImageChange={handleUpload}
        onImageDelete={handleDelete}
        isProcessing={isProcessing}
      />

      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {displayName}
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          {email}
        </p>
      </div>
    </div>
  );
}