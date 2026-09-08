import { createFileRoute } from "@tanstack/react-router";
import { Publications } from "@/components/site/Publications";
import { serviceHead } from "@/lib/services";
export const Route = createFileRoute("/books")({
  head: () =>
    serviceHead("ClearFact Books", "/books", "Browse books published by ClearFact Media Ltd."),
  component: () => <Publications kind="books" />,
});
