import { createFileRoute } from "@tanstack/react-router";
import { Publications } from "@/components/site/Publications";
import { serviceHead } from "@/lib/services";
export const Route = createFileRoute("/e-print")({
  head: () =>
    serviceHead(
      "ClearFact E-Print",
      "/e-print",
      "Browse digital newspaper editions published by ClearFact Media Ltd.",
    ),
  component: () => <Publications kind="eprint" />,
});
