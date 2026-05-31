import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, UserCog } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

const ROLES = ["super_admin", "admin", "editor", "journalist", "fact_checker", "moderator", "contributor_manager"] as const;
type Role = typeof ROLES[number];

type Row = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  roles: Role[];
};

function AdminUsers() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, bio");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const map = new Map<string, Role[]>();
    (roles ?? []).forEach((r) => {
      const arr = map.get(r.user_id) ?? [];
      arr.push(r.role as Role);
      map.set(r.user_id, arr);
    });
    setRows((profiles ?? []).map((p) => ({ ...p, roles: map.get(p.user_id) ?? [] })));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (userId: string, role: Role, has: boolean) => {
    setBusy(`${userId}:${role}`);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) toast.error(error.message); else toast.success(`Removed ${role}`);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) toast.error(error.message); else toast.success(`Granted ${role}`);
    }
    setBusy(null);
    load();
  };

  return (
    <div className="container-news py-8">
      <h1 className="font-serif text-3xl flex items-center gap-2"><UserCog className="h-7 w-7 text-primary" /> User & role management</h1>
      <p className="text-sm text-muted-foreground mt-1">Assign newsroom roles. Only Super Admins and Admins should manage roles.</p>

      <div className="mt-6 rounded-sm border border-border overflow-x-auto">
        {rows === null ? (
          <div className="p-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading users…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">User</th>
                {ROLES.map((r) => <th key={r} className="p-3 text-center capitalize">{r.replace("_", " ")}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.user_id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-semibold">{u.display_name || "Unnamed user"}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{u.user_id.slice(0, 8)}…</div>
                  </td>
                  {ROLES.map((r) => {
                    const has = u.roles.includes(r);
                    const id = `${u.user_id}:${r}`;
                    return (
                      <td key={r} className="p-3 text-center">
                        <button onClick={() => toggle(u.user_id, r, has)} disabled={busy === id}
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-sm transition ${
                            has ? "bg-primary text-primary-foreground" : "bg-background border border-border hover:bg-accent"
                          }`}>
                          {busy === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="p-6 text-muted-foreground" colSpan={ROLES.length + 1}>No users yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
