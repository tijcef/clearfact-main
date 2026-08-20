import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/editorial-policy")({
head: () => ({
meta: [
{ title: "Editorial Policy — ClearFact News" },
{
name: "description",
content:
"ClearFact News editorial standards covering sourcing, verification, accuracy, corrections, independence, conflicts of interest, AI use, sponsored content and public-interest journalism.",
},
{
property: "og:title",
content: "Editorial Policy — ClearFact News",
},
{
property: "og:description",
content:
"Our newsroom standards for reporting, sourcing, verification, corrections and editorial independence.",
},
],
}),

component: () => ( <SimplePage
   eyebrow="Editorial Standards"
   title="Editorial Policy"
   intro="Our newsroom standards are public so readers, sources and partners can understand how ClearFact News reports, verifies and publishes information."
 > <section> <p> <strong>ClearFact News</strong> is committed to accurate,
independent, fair and responsible journalism. Our editorial
decisions are guided by the public interest and our responsibility to
provide readers with reliable information. </p>

    <p>
      We distinguish clearly between verified facts, allegations, opinions,
      analysis, developing information and sponsored material.
    </p>
  </section>

  <section>
    <h2>1. Accuracy</h2>

    <p>
      Accuracy is fundamental to our journalism. We seek to verify
      information before publication and avoid presenting unconfirmed
      claims as established facts.
    </p>

    <p>
      When information is still developing, we clearly communicate what is
      known, what remains unconfirmed and what authorities or relevant
      parties have said.
    </p>
  </section>

  <section>
    <h2>2. Sourcing</h2>

    <p>
      We prefer named, on-the-record sources whenever possible. We seek
      information from credible individuals, official records, documents,
      institutions and other reliable sources.
    </p>

    <p>
      Anonymous sources may be used when the information is genuinely in
      the public interest and the source has a legitimate reason for
      confidentiality. Anonymous sourcing requires appropriate editorial
      review and a clear justification.
    </p>
  </section>

  <section>
    <h2>3. Verification</h2>

    <p>
      ClearFact journalists and editors seek to verify important claims
      before publication using primary documents, official statements,
      direct interviews, independent sources and other credible evidence.
    </p>

    <p>
      Information originating from social media is treated as unverified
      until appropriately checked.
    </p>

    <p>
      Where appropriate, verification may include checking documents,
      dates, locations, photographs, videos, public records and statements
      from relevant institutions or individuals.
    </p>
  </section>

  <section>
    <h2>4. Breaking News</h2>

    <p>
      Speed matters in digital journalism, but accuracy comes first.
      Breaking-news reports may be updated as new information becomes
      available.
    </p>

    <p>
      When facts remain uncertain, we identify the uncertainty rather than
      presenting speculation as fact.
    </p>

    <p>
      Significant updates may be reflected in the article and, where
      appropriate, the publication or update time will be clearly shown.
    </p>
  </section>

  <section>
    <h2>5. Claims and Allegations</h2>

    <p>
      ClearFact distinguishes between a person's claim and an independently
      verified fact.
    </p>

    <p>
      When reporting allegations, accusations or disputed claims, we
      attribute them clearly to the person, organisation or source making
      the claim.
    </p>

    <p>
      We seek responses from relevant parties where appropriate and
      reasonably possible.
    </p>
  </section>

  <section>
    <h2>6. Right of Reply</h2>

    <p>
      When reporting serious allegations that could significantly affect a
      person's or organisation's reputation, we seek to provide a
      reasonable opportunity for the relevant party to respond.
    </p>

    <p>
      If a response is not available before publication, we may publish
      based on the available verified information and update the report
      when a meaningful response is received.
    </p>
  </section>

  <section>
    <h2>7. Corrections</h2>

    <p>
      We correct factual errors when identified. Corrections may include
      changes to names, dates, figures, quotations, descriptions or other
      material facts.
    </p>

    <p>
      Significant corrections should be made transparently rather than
      silently altering the record.
    </p>

    <p>
      Readers can report potential errors through our{" "}
      <a
        href="/contact"
        className="text-primary font-semibold hover:underline"
      >
        Contact
      </a>{" "}
      page or by contacting the editorial desk at{" "}
      <a
        href="mailto:editor@clearfact.ng"
        className="text-primary font-semibold hover:underline"
      >
        editor@clearfact.ng
      </a>
      .
    </p>
  </section>

  <section>
    <h2>8. Editorial Independence</h2>

    <p>
      ClearFact's editorial decisions are independent of advertisers,
      sponsors, political organisations and other commercial interests.
    </p>

    <p>
      Commercial relationships must not determine whether a legitimate
      news story is published, how it is reported or how it is presented
      editorially.
    </p>
  </section>

  <section>
    <h2>9. Conflicts of Interest</h2>

    <p>
      Journalists and editors should disclose relevant conflicts of
      interest to appropriate editorial leadership.
    </p>

    <p>
      Staff should avoid situations in which personal, financial,
      political or professional interests could reasonably compromise
      editorial independence.
    </p>
  </section>

  <section>
    <h2>10. Sponsored Content and Advertising</h2>

    <p>
      Sponsored content, advertising and other commercial material are
      clearly distinguished from independent editorial journalism.
    </p>

    <p>
      Commercial partners do not receive editorial control over independent
      reporting.
    </p>

    <p>
      Advertising and partnership enquiries can be directed to{" "}
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
    <h2>11. Opinion and Analysis</h2>

    <p>
      Opinion and analysis are clearly identified so readers can distinguish
      commentary from straight news reporting.
    </p>

    <p>
      Opinion writers are responsible for supporting factual assertions
      within their work and should not knowingly present false information
      as fact.
    </p>
  </section>

  <section>
    <h2>12. Images and Videos</h2>

    <p>
      We seek to accurately identify and contextualise photographs, videos
      and other visual material.
    </p>

    <p>
      We do not knowingly publish manipulated or misleading visual
      material as authentic.
    </p>

    <p>
      When appropriate, captions and credits are provided to explain the
      origin or context of visual material.
    </p>
  </section>

  <section>
    <h2>13. Artificial Intelligence</h2>

    <p>
      AI tools may assist ClearFact's newsroom with tasks such as
      transcription, summarisation, translation, research assistance,
      pattern detection, data processing or other newsroom workflows.
    </p>

    <p>
      AI-generated or AI-assisted information is not treated as inherently
      reliable. Journalists and editors remain responsible for verifying
      information before publication.
    </p>

    <p>
      We do not knowingly publish fabricated information generated by AI as
      factual journalism.
    </p>
  </section>

  <section>
    <h2>14. Privacy and Sensitive Information</h2>

    <p>
      We consider privacy, safety and public interest when deciding whether
      personal information should be published.
    </p>

    <p>
      Sensitive personal information should not be published merely
      because it is available. Editors should consider relevance,
      verification, potential harm and legitimate public interest.
    </p>
  </section>

  <section>
    <h2>15. Children and Vulnerable People</h2>

    <p>
      Additional care is taken when reporting stories involving children,
      victims of violence, vulnerable individuals and people facing
      significant personal risk.
    </p>

    <p>
      Identification decisions should consider public interest, safety,
      legal obligations and potential harm.
    </p>
  </section>

  <section>
    <h2>16. Headlines and Presentation</h2>

    <p>
      Headlines should accurately represent the content of the article.
      ClearFact does not intentionally use misleading headlines designed
      to generate clicks through deception.
    </p>

    <p>
      Strong headlines are encouraged, but they must remain consistent with
      the facts and context contained in the story.
    </p>
  </section>

  <section>
    <h2>17. Developing Stories</h2>

    <p>
      Developing stories may change as new information becomes available.
      Articles may therefore be updated, expanded or corrected as facts are
      confirmed.
    </p>

    <p>
      Readers should pay attention to publication and update information
      when following rapidly developing events.
    </p>
  </section>

  <section>
    <h2>18. Public Interest Journalism</h2>

    <p>
      ClearFact supports journalism that informs the public, strengthens
      accountability, explains important developments and gives communities
      access to information that affects their lives.
    </p>

    <p>
      Public-interest journalism may include investigations, data
      journalism, accountability reporting, explanatory journalism and
      community reporting.
    </p>
  </section>

  <section>
    <h2>19. Reader Accountability</h2>

    <p>
      We welcome credible feedback from readers, sources, experts and
      institutions.
    </p>

    <p>
      Questions about accuracy, corrections or editorial standards can be
      directed to our editorial desk.
    </p>

    <p>
      <strong>Editorial Desk:</strong>{" "}
      <a
        href="mailto:editor@clearfact.ng"
        className="text-primary font-semibold hover:underline"
      >
        editor@clearfact.ng
      </a>
    </p>
  </section>

  <section>
    <h2>Our Commitment</h2>

    <p>
      ClearFact News will continue to improve its editorial processes as
      the newsroom grows. Our goal is simple:
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
