"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client/client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createSupabaseClient();

  const refreshUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }, [supabase]);

  useEffect(() => {
    // Initial user fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        router.refresh();
      }

      if (event === "SIGNED_OUT") {
        router.push("/login");
        router.refresh();
      }
    });

    // Listen for custom profile update events
    const onProfileUpdated = () => {
      refreshUser();
    };
    window.addEventListener("user-profile-updated", onProfileUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("user-profile-updated", onProfileUpdated);
    };
  }, [router, supabase, refreshUser]);
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
