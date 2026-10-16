/** Explicit editorial decisions only; no automatic "Verified" badge. */
export function EditorialDisclosure({ post, compact = false }: { post: any; compact?: boolean }) {
  const fields = post?.clearfact_publishing ?? {};
  const flag = post?.acf?.is_sponsored;
  const sponsored =
    fields.sponsored === true ||
    fields.content_type === "sponsored" ||
    [true, 1, "1", "yes", "true"].includes(flag) ||
    post?.acf?.verification_status === "Sponsored" ||
    post?._embedded?.["wp:term"]?.[0]?.some((term: any) =>
      ["sponsored", "sponsored-content"].includes(term.slug),
    );
  const labels: Record<string, string> = {
    under_review: "Under review",
    developing: "Developing",
    verified: "Verified by editor",
    fact_checked: "Fact checked",
  };
  if (compact)
    return sponsored ? (
      <span className="text-xs font-semibold uppercase tracking-wide">Sponsored</span>
    ) : null;
  const label = labels[String(fields.verification ?? "")];
  if (!sponsored && !label && !fields.correction) return null;
  return (
    <aside
      className="mb-5 rounded-lg border border-border bg-muted/30 p-4 text-sm"
      aria-label="Editorial disclosure"
    >
      {sponsored && (
        <p>
          <strong>Sponsored content{fields.sponsor_name ? ` · ${fields.sponsor_name}` : ""}</strong>
          <br />
          {fields.disclosure || "This is paid content."}
        </p>
      )}
      {label && <p className={sponsored ? "mt-2" : ""}>{label}</p>}
      {fields.correction && (
        <p className="mt-2">
          <strong>Correction / update: </strong>
          {fields.correction}
        </p>
      )}
    </aside>
  );
}
