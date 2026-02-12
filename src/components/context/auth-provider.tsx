"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client/client";

// Static client - this NEVER changes, preventing re-render loops
const supabase = createSupabaseClient();

type AuthContextType = { user: User | null; loading: boolean };
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    setUser(updatedUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(initialUser);
        setLoading(false); // Set to false only ONCE here
      }
    }
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      const newUser = session?.user ?? null;
      // Only update state if the user ID actually changed to prevent loops
      setUser((prev) => (prev?.id === newUser?.id ? prev : newUser));

      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    const onProfileUpdated = () => refreshUser();
    window.addEventListener("user-profile-updated", onProfileUpdated);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("user-profile-updated", onProfileUpdated);
    };
  }, [router, refreshUser]);

  // Memoized value - reference stays the same unless user/loading changes
  const contextValue = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);