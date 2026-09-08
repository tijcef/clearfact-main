import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  loading: boolean;
  isEditor: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        if (s) {
          setTimeout(async () => {
            try {
              const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
              setIsEditor(!!data?.some((r) => r.role === "editor" || r.role === "admin"));
            } catch (error) { console.error("[Auth] Role check failed", error); }
          }, 0);
        } else setIsEditor(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      }).catch((error) => {
        console.error("[Auth] Unable to load session", error);
        setSession(null);
        setLoading(false);
      });
    } catch (error) {
      console.error("[Auth] Supabase is not configured", error);
      setSession(null);
      setLoading(false);
    }
    return unsubscribe;
  }, []);

  return {
    session,
    loading,
    isEditor,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
