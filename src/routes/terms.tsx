import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — ClearFact News" },
      {
        name: "description",
        content:
          "Terms and conditions governing access to and use of the ClearFact News website, content, services and digital platforms.",
      },
      {
        property: "og:title",
        content: "Terms & Conditions — ClearFact News",
      },
      {
        property: "og:description",
        content:
          "The terms governing the use of ClearFact News, its content, services and digital platforms.",
      },
      { property: "og:url", content: "https://clearfact.ng/terms" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/terms" }],
  }),

  component: () => (
    <SimplePage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="These terms explain the rules governing access to and use of ClearFact News and its digital services."
    >
      {" "}
      <section>
        {" "}
        <p>
          Welcome to <strong>ClearFact News</strong>. By accessing or using clearfact.ng, you agree
          to comply with these Terms & Conditions. If you do not agree with these terms, please do
          not use the website.{" "}
        </p>
        <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
      </section>
      <section>
        <h2>1. About ClearFact News</h2>

        <p>
          ClearFact News is a digital-first Nigerian news platform providing journalism, reporting,
          analysis, features, research, commentary and other editorial content.
        </p>

        <p>
          Our editorial standards are explained in our{" "}
          <a href="/editorial-policy" className="text-primary font-semibold hover:underline">
            Editorial Policy
          </a>
          .
        </p>
      </section>
      <section>
        <h2>2. Use of the Website</h2>

        <p>
          You may access and use ClearFact.ng for lawful personal, informational and non-commercial
          purposes.
        </p>

        <p>
          You agree not to use the website in a manner that violates applicable laws, interferes
          with the operation of the website or infringes the rights of ClearFact or another person.
        </p>
      </section>
      <section>
        <h2>3. Intellectual Property</h2>

        <p>
          Unless otherwise stated, the text, graphics, logos, photographs, videos, designs,
          trademarks, layout and other original materials published by ClearFact News are protected
          by applicable intellectual property laws.
        </p>

        <p>
          You may share links to ClearFact articles for legitimate informational purposes, provided
          the source is clearly attributed to ClearFact News.
        </p>

        <p>
          Republishing, reproducing, modifying, commercially exploiting or distributing substantial
          portions of ClearFact content without written permission is prohibited.
        </p>
      </section>
      <section>
        <h2>4. Linking to ClearFact</h2>

        <p>
          You may link to publicly accessible ClearFact articles provided that the link does not
          falsely suggest sponsorship, endorsement, partnership or affiliation with ClearFact News.
        </p>

        <p>
          Websites or platforms that reproduce ClearFact content should provide appropriate
          attribution and link back to the original article where applicable.
        </p>
      </section>
      <section>
        <h2>5. News Accuracy and Updates</h2>

        <p>
          ClearFact News makes reasonable efforts to verify information before publication and
          follows its published editorial standards.
        </p>

        <p>
          News events can develop quickly, and information may change after publication. Articles
          may therefore be updated, corrected or expanded as new verified information becomes
          available.
        </p>

        <p>
          Our{" "}
          <a href="/editorial-policy" className="text-primary font-semibold hover:underline">
            Editorial Policy
          </a>{" "}
          explains our approach to sourcing, verification and corrections.
        </p>
      </section>
      <section>
        <h2>6. No Guarantee of Completeness</h2>

        <p>
          While we aim to provide accurate and useful information, ClearFact does not guarantee that
          every article, statistic, statement or other content will always be complete, current or
          free from error.
        </p>

        <p>
          Readers should exercise appropriate judgment when relying on information published on the
          website, particularly where decisions involving legal, financial, medical or other
          professional matters are concerned.
        </p>
      </section>
      <section>
        <h2>7. User Submissions</h2>

        <p>
          Users may submit information, news tips, documents, comments or other materials through
          channels provided by ClearFact.
        </p>

        <p>
          By submitting material, you confirm that you have the right to provide it and that you are
          not knowingly submitting fabricated, fraudulent or unlawful material.
        </p>

        <p>Submission of information does not guarantee publication or editorial action.</p>

        <p>
          If you have sensitive information, please review the instructions on our{" "}
          <a href="/submit-story" className="text-primary font-semibold hover:underline">
            Submit a Story
          </a>{" "}
          page before submitting it.
        </p>
      </section>
      <section>
        <h2>8. Comments and User-Generated Content</h2>

        <p>
          Where ClearFact provides comments or other user-generated features, users are responsible
          for the material they submit.
        </p>

        <p>
          Content that is unlawful, threatening, defamatory, abusive, discriminatory, fraudulent,
          misleading, invasive of privacy or otherwise inappropriate may be removed.
        </p>

        <p>
          ClearFact reserves the right to moderate, remove or restrict user-generated content where
          reasonably necessary.
        </p>
      </section>
      <section>
        <h2>9. Advertising and Sponsored Content</h2>

        <p>ClearFact may display advertising, sponsored content and commercial partnerships.</p>

        <p>
          Sponsored and commercial content should be clearly distinguished from independent
          editorial journalism.
        </p>

        <p>
          Advertising relationships do not automatically determine editorial coverage or guarantee
          favourable editorial treatment.
        </p>

        <p>
          Advertising enquiries can be directed to{" "}
          <a
            href="mailto:advertise@clearfact.ng"
            className="text-primary font-semibold hover:underline"
          >
            advertise@clearfact.ng
          </a>
          .
        </p>
      </section>
      <section>
        <h2>10. Third-Party Links</h2>

        <p>ClearFact articles or pages may contain links to third-party websites and services.</p>

        <p>
          These links are provided for convenience, reference or additional information. ClearFact
          does not control third-party websites and is not responsible for their content,
          availability, privacy practices or terms.
        </p>
      </section>
      <section>
        <h2>11. Prohibited Activities</h2>

        <p>You agree not to:</p>

        <ul>
          <li>Attempt to gain unauthorised access to the website or its systems.</li>

          <li>Interfere with the security, availability or normal operation of the website.</li>

          <li>
            Use automated systems to scrape or reproduce substantial amounts of ClearFact content
            without permission.
          </li>

          <li>
            Use ClearFact content to misrepresent another organisation, individual or product.
          </li>

          <li>Submit knowingly false, fraudulent or malicious information.</li>

          <li>Use the website for unlawful purposes.</li>
        </ul>
      </section>
      <section>
        <h2>12. Website Availability</h2>

        <p>
          We aim to keep ClearFact.ng available and reliable, but we do not guarantee uninterrupted
          access.
        </p>

        <p>
          The website may occasionally be unavailable because of maintenance, technical problems,
          hosting issues, security incidents or other circumstances beyond our reasonable control.
        </p>
      </section>
      <section>
        <h2>13. Limitation of Liability</h2>

        <p>
          To the extent permitted by applicable law, ClearFact News shall not be responsible for
          losses or damages arising from reliance on website content, interruptions to website
          availability or third-party websites and services.
        </p>

        <p>
          Nothing in these terms is intended to exclude or limit liability that cannot lawfully be
          excluded or limited under applicable law.
        </p>
      </section>
      <section>
        <h2>14. Privacy</h2>

        <p>
          Our handling of personal information is governed by our{" "}
          <a href="/privacy" className="text-primary font-semibold hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </section>
      <section>
        <h2>15. Careers and Applications</h2>

        <p>
          Information submitted through our careers channels may be reviewed for recruitment
          purposes.
        </p>

        <p>
          Employment applications should be directed to{" "}
          <a
            href="mailto:careers@clearfact.ng"
            className="text-primary font-semibold hover:underline"
          >
            careers@clearfact.ng
          </a>
          .
        </p>
      </section>
      <section>
        <h2>16. Changes to These Terms</h2>

        <p>
          ClearFact News may update these Terms &amp; Conditions from time to time to reflect
          changes to our services, practices or applicable requirements.
        </p>

        <p>The updated version will be published on this page with an updated date.</p>
      </section>
      <section>
        <h2>17. Governing Law</h2>

        <p>
          These terms are intended to be interpreted in accordance with the applicable laws of the
          Federal Republic of Nigeria, subject to any mandatory legal requirements that may apply.
        </p>
      </section>
      <section>
        <h2>18. Contact</h2>

        <p>Questions about these Terms &amp; Conditions can be directed to:</p>

        <p>
          <strong>ClearFact News</strong>
          <br />
          32 Demsawo, Jimeta, Yola, Nigeria
          <br />
          <a href="mailto:info@clearfact.ng" className="text-primary font-semibold hover:underline">
            info@clearfact.ng
          </a>
        </p>
      </section>
      <section>
        <h2>Our Commitment</h2>

        <p>
          ClearFact News is committed to building a trusted digital news platform where journalism,
          transparency, technology and public interest work together.
        </p>

        <p className="font-serif text-2xl leading-9">
          <strong>Verified Journalism. Public Trust. Meaningful Impact.</strong>
        </p>

        <p className="text-sm text-muted-foreground">
          ClearFact News
          <br />
          Verified Journalism From Nigeria
        </p>
      </section>
    </SimplePage>
  ),
});
