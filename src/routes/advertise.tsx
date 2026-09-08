import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SimplePage } from "@/components/site/SimplePage";
import { ServiceForm } from "@/components/site/ServiceForm";
import { getServiceData, safeExternalUrl, serviceHead, type ServiceConfig } from "@/lib/services";
export const Route = createFileRoute("/advertise")({
  head: () =>
    serviceHead(
      "Advertising & Media Services",
      "/advertise",
      "Request advertising, pay for agreed media services and submit your brief to ClearFact Media Ltd.",
    ),
  component: Advertise,
});
function Advertise() {
  const [config, setConfig] = useState<ServiceConfig | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getServiceData<ServiceConfig>("config")
      .then(setConfig)
      .catch(() =>
        setError(
          "Online requests are temporarily unavailable. Email ads@clearfact.ng for a quote, payment instructions or to send your brief.",
        ),
      );
  }, []);
  return (
    <SimplePage
      eyebrow="ClearFact Media Ltd"
      title="Advertising & media services"
      intro="Tell us what you need, agree your campaign with our team, then pay and send your materials."
    >
      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        {[
          [
            "01",
            "Request & agree",
            "Submit your brief. Our team confirms the scope, price and schedule.",
          ],
          [
            "02",
            "Pay & send proof",
            "Pay the agreed amount and forward proof to ads@clearfact.ng.",
          ],
          [
            "03",
            "Receive your receipt",
            "Staff verify the payment and email your receipt before arranging delivery.",
          ],
        ].map(([n, title, body]) => (
          <section key={n} className="border-t-4 border-gold bg-accent p-5">
            <p className="text-sm font-semibold text-muted-foreground">{n}</p>
            <h2 className="!text-xl !mt-2">{title}</h2>
            <p className="text-base">{body}</p>
          </section>
        ))}
      </div>
      <ServiceForm />
      {error && <p role="alert">{error}</p>}
      {!config && !error && <p role="status">Loading service options…</p>}
      {config && !config.ready && (
        <p>
          For service requests, please email <a href="mailto:ads@clearfact.ng">ads@clearfact.ng</a>.
          You can complete the form below; if online saving is unavailable, use its email option.
        </p>
      )}
      <section className="my-8 rounded border border-border p-6">
        <h2 className="!mt-0">Pay for an agreed service</h2>
        <p>Use the price and invoice reference confirmed by our advertising team.</p>
        {config?.bank && config.account_name && config.account_number && (
          <dl className="grid gap-2 mt-4">
            <div>
              <dt className="text-sm text-muted-foreground">Bank</dt>
              <dd className="font-semibold">{config.bank}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Account name</dt>
              <dd className="font-semibold">{config.account_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Account number</dt>
              <dd className="font-mono text-xl">{config.account_number}</dd>
            </div>
          </dl>
        )}
        {config && safeExternalUrl(config.payment_url) && (
          <a
            href={safeExternalUrl(config.payment_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 font-semibold"
          >
            Continue to secure payment ↗
          </a>
        )}
        {config?.instructions && <p className="mt-4 whitespace-pre-line">{config.instructions}</p>}
        {!config?.payment_url &&
          !(config?.bank && config.account_name && config.account_number) && (
            <p className="mt-4">
              Contact{" "}
              <a href="mailto:ads@clearfact.ng?subject=Payment%20instructions">ads@clearfact.ng</a>{" "}
              for confirmed payment instructions.
            </p>
          )}
        <p className="mt-4">
          Email your proof, invoice or request reference and advert files to{" "}
          <a href="mailto:ads@clearfact.ng?subject=Payment%20proof%20and%20advertising%20materials">
            ads@clearfact.ng
          </a>
          . A payment screenshot is subject to verification; your receipt is issued only after
          payment is confirmed.
        </p>
      </section>
      <h2>Editorial independence</h2>
      <p>
        Sponsored content is clearly labelled. Advertising and partnerships do not control our news
        coverage. For longer-term collaboration, <a href="/partnership">apply for a partnership</a>.
      </p>
    </SimplePage>
  );
}
