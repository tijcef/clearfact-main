import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { Bell, BellOff } from "lucide-react";

type Notif = Database["public"]["Tables"]["notifications"]["Row"];

export const Route = createFileRoute("/contributor/notifications")({
  component: Notifs,
});

function Notifs() {
  const { session } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50);
      setItems((data ?? []) as Notif[]);
      await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id).eq("read", false);
    })();
  }, [session]);

  return (
    <div className="container-news py-8">
      <h1 className="font-serif text-3xl mb-4">Notifications</h1>
      <div className="rounded-sm border border-border bg-card divide-y divide-border">
        {items.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground inline-flex items-center justify-center gap-2 w-full"><BellOff className="h-4 w-4" /> No notifications yet</div>
        )}
        {items.map((n) => (
          <a key={n.id} href={n.link ?? "#"} className="flex gap-3 p-4 hover:bg-accent/40">
            <Bell className="h-4 w-4 mt-1 text-primary" />
            <div className="flex-1">
              <div className="font-semibold">{n.title}</div>
              {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
              <div className="text-[11px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
