import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ArticleEditor } from "@/components/site/ArticleEditor";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Article = Database["public"]["Tables"]["articles"]["Row"];

export const Route = createFileRoute("/admin/edit/$id")({
  component: EditArticle,
});

function EditArticle() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
      if (error) { toast.error(error.message); navigate({ to: "/admin" }); return; }
      if (!data) { toast.error("Not found"); navigate({ to: "/admin" }); return; }
      setArticle(data);
    })();
  }, [id, navigate]);

  if (!article) return <div className="container-news py-12 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading article…</div>;
  return <ArticleEditor existing={article} />;
}
