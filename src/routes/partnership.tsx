import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SimplePage } from "@/components/site/SimplePage";
import { ServiceForm } from "@/components/site/ServiceForm";
import { getServiceData, serviceHead, type ServiceConfig } from "@/lib/services";
export const Route = createFileRoute("/partnership")({
  head: () =>
    serviceHead(
      "Partner with ClearFact",
      "/partnership",
      "Individuals and organisations can apply to partner with ClearFact Media Ltd.",
    ),
  component: Partnership,
});
function Partnership() {
  const [message, setMessage] = useState("Loading application form…");
  useEffect(() => {
    getServiceData<ServiceConfig>("config")
      .then((c) => {
        setMessage(
          c.ready
            ? ""
            : "Complete the form below. If online saving is unavailable, use its email option.",
        );
      })
      .catch(() =>
        setMessage(
          "Online applications are temporarily unavailable. Send your proposal to info@clearfact.ng.",
        ),
      );
  }, []);
  return (
    <SimplePage
      eyebrow="Work with ClearFact Media Ltd"
      title="Partnerships with purpose"
      intro="Individuals and organisations can propose media partnerships, event collaborations, publishing projects and public-interest initiatives."
    >
      <ServiceForm partnership />
      {message && <p role="status">{message}</p>}
      <h2>What happens next?</h2>
      <p>
        Our team reviews your proposal and contacts you using the details provided. Any partnership
        requires an agreed scope and written confirmation. Editorial decisions remain independent.
      </p>
      <p>
        Enquiries: <a href="mailto:info@clearfact.ng">info@clearfact.ng</a>.
      </p>
    </SimplePage>
  );
}
