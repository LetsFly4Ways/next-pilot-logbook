import { useAuth } from "@/components/context/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const { user, loading } = useAuth();

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userAvatar = user?.user_metadata?.avatar_url;

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-12 h-12 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-muted text-muted-foreground">
            ?
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Unknown User</p>
          <p className="text-sm text-muted-foreground">No email available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-12 h-12">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback className="bg-secondary text-primary-foreground font-medium">
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-left text-lg font-semibold text-foreground text-balance">
          {userName}
        </p>
        <p className="text-xs text-muted-foreground">{userEmail}</p>
      </div>
    </div>
  );
}