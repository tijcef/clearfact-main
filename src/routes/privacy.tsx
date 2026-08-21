import { createFileRoute } from "@tanstack/react-router";

import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ClearFact News" },
      {
        name: "description",
        content:
          "How ClearFact News collects, uses, shares and protects reader information, including advertising and cookie disclosures.",
      },
      { property: "og:title", content: "Privacy Policy — ClearFact News" },
      {
        property: "og:description",
        content: "Reader privacy, cookies, analytics and advertising at ClearFact News.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clearfact.ng/privacy" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://clearfact.ng/privacy",
      },
    ],
  }),

  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SimplePage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This policy explains what information ClearFact News collects, why we use it and the choices available to readers."
    >
      <section>
        <p className="text-sm text-muted-foreground">Last updated: 21 August 2026</p>

        <p>
          This Privacy Policy applies to ClearFact News websites, digital services and reader
          interactions operated by Clearfact Media Ltd. By using clearfact.ng, you acknowledge the
          practices described in this policy.
        </p>
      </section>

      <section>
        <h2>1. Information We Collect</h2>

        <h3>Information you provide</h3>
        <p>
          We may collect information you voluntarily provide when you contact the newsroom, submit a
          correction or story tip, post a comment, subscribe to a newsletter, apply for an
          opportunity or use another form made available on the website. This may include your name,
          email address, telephone number, message and any documents or other material you choose to
          provide.
        </p>

        <h3>Information collected automatically</h3>
        <p>
          When you visit the website, our systems and service providers may automatically receive
          technical information such as your IP address, browser and device type, operating system,
          referring page, approximate location, pages viewed, timestamps and interactions with the
          website.
        </p>
      </section>

      <section>
        <h2>2. Cookies and Similar Technologies</h2>

        <p>
          ClearFact and its service providers may use cookies, local storage, pixels, web beacons
          and similar technologies to operate the site, remember preferences, measure readership,
          protect services and support advertising.
        </p>

        <p>
          You can restrict or delete cookies using your browser controls. Disabling some cookies may
          affect features or preferences on the website.
        </p>
      </section>

      <section>
        <h2>3. Advertising and Google AdSense</h2>

        <p>
          ClearFact may use Google AdSense and other advertising partners to display advertisements.
          Third-party vendors, including Google, may place and read cookies on your browser or use
          web beacons, IP addresses and similar technologies to collect information as a result of
          advertising being served on this website.
        </p>

        <p>
          Google may use advertising cookies to serve and personalise ads based on your visit to
          ClearFact and other websites. Where required, you will be offered privacy and consent
          choices before personalised advertising technologies are used.
        </p>

        <p>
          You can learn how Google uses information from sites that use its services through
          Google&apos;s{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            partner-sites privacy information
          </a>
          . You can manage personalised advertising through{" "}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>
          .
        </p>
      </section>

      <section>
        <h2>4. Analytics and Performance Measurement</h2>

        <p>
          We may use analytics services, including Google Analytics, to understand how readers find
          and use ClearFact. Analytics providers may process device information, IP addresses, page
          activity and cookie identifiers to produce aggregated readership and performance reports.
        </p>

        <p>
          Analytics information helps us improve navigation, site reliability, article presentation
          and the overall reader experience. Consent or other privacy controls will be applied where
          required by applicable law.
        </p>
      </section>

      <section>
        <h2>5. How We Use Information</h2>

        <ul>
          <li>To publish and deliver ClearFact journalism and digital services.</li>
          <li>To respond to enquiries, corrections, tips and reader feedback.</li>
          <li>To operate comments, newsletters and requested communications.</li>
          <li>To measure readership and improve the website.</li>
          <li>To protect the website, readers and newsroom systems from abuse.</li>
          <li>To comply with legal obligations and enforce our policies.</li>
          <li>To support advertising and commercial sustainability.</li>
        </ul>
      </section>

      <section>
        <h2>6. How Information May Be Shared</h2>

        <p>
          We may share limited information with hosting, analytics, advertising, email, security and
          other service providers that help us operate ClearFact. These providers process
          information for the services they supply and are subject to their own contractual and
          legal responsibilities.
        </p>

        <p>
          We may also disclose information when required by law, to protect rights and safety, to
          investigate fraud or abuse, or as part of a legitimate corporate restructuring. ClearFact
          does not sell reader contact information as a mailing list.
        </p>
      </section>

      <section>
        <h2>7. News Tips and Confidential Material</h2>

        <p>
          Ordinary email and website forms should not be treated as fully anonymous or secure
          channels. Before sending highly sensitive or confidential material, review our
          whistleblower guidance or contact the editorial team to agree on an appropriate submission
          method.
        </p>
      </section>

      <section>
        <h2>8. Data Retention and Security</h2>

        <p>
          We retain information only for as long as reasonably necessary for the purpose for which
          it was collected, newsroom recordkeeping, security, dispute resolution and legal
          compliance. Retention periods vary according to the type of information and the service
          involved.
        </p>

        <p>
          We use reasonable administrative and technical safeguards to protect information. No
          internet transmission or storage system can be guaranteed to be completely secure.
        </p>
      </section>

      <section>
        <h2>9. Your Choices and Rights</h2>

        <p>
          Depending on applicable law, you may have rights to request access, correction, deletion,
          restriction or objection concerning personal information associated with you. You may also
          withdraw consent where processing relies on consent and unsubscribe from promotional email
          through the link provided in the message.
        </p>

        <p>
          To make a privacy request, email{" "}
          <a href="mailto:info@clearfact.ng?subject=Privacy%20Request">info@clearfact.ng</a>. We may
          need to verify your identity before completing a request.
        </p>
      </section>

      <section>
        <h2>10. Children&apos;s Privacy</h2>

        <p>
          ClearFact is a general-audience news service and is not directed at children under 13. We
          do not knowingly collect personal information from children under 13 without appropriate
          authorisation.
        </p>
      </section>

      <section>
        <h2>11. External Links</h2>

        <p>
          Articles may link to third-party websites. ClearFact does not control the privacy
          practices of those websites, and readers should review the policies of the relevant third
          party.
        </p>
      </section>

      <section>
        <h2>12. Changes to This Policy</h2>

        <p>
          We may update this policy when our services, legal obligations or technology change. The
          latest version will be published on this page with an updated effective date.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>

        <p>
          Privacy questions and requests can be directed to{" "}
          <a href="mailto:info@clearfact.ng?subject=Privacy%20Request">info@clearfact.ng</a> or:
        </p>

        <p>
          Clearfact Media Ltd
          <br />
          32 Demsawo, Jimeta, Yola, Adamawa State, Nigeria
        </p>
      </section>
    </SimplePage>
  );
}
