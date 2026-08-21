import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ClearFact News — Independent Nigerian Journalism" },
      {
        name: "description",
        content:
          "Learn about ClearFact News, an independent Nigerian digital newsroom committed to accurate, verified, fair, transparent and responsible journalism.",
      },
      {
        property: "og:title",
        content: "About ClearFact News — Independent Nigerian Journalism",
      },
      {
        property: "og:description",
        content:
          "ClearFact News is an independent Nigerian digital newsroom committed to accurate, verified, fair and transparent journalism.",
      },
      { property: "og:url", content: "https://clearfact.ng/about" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/about" }],
  }),

  component: () => (
    <SimplePage
      eyebrow="About ClearFact News"
      title="Independent journalism built on accuracy, verification and public trust."
      intro={`ClearFact News is an independent Nigerian digital newsroom committed to delivering accurate, verified, transparent and responsible journalism that informs, educates and empowers the public.

We believe reliable information is essential to democracy, accountability and informed decision-making. Our newsroom is committed to reporting matters of public interest with fairness, context and respect for the facts.

Founded by Emmanuel Sunday Tijwun, ClearFact News was established to provide credible journalism in an environment where misinformation, sensationalism and unverified claims can spread rapidly. We are committed to producing news that readers can trust while maintaining editorial independence and professional responsibility.`}
    >
      <h2>Our Mission</h2>
      <p>
        To provide accurate, verified, transparent and responsible journalism that informs the
        Nigerian and global public, promotes accountability and contributes to an informed society.
      </p>

      <h2>Our Vision</h2>
      <p>
        To be one of Africa&apos;s most trusted digital news platforms, recognised for accuracy,
        independence, fairness, responsible journalism and public-interest reporting.
      </p>

      <h2>Editorial Independence</h2>
      <p>
        ClearFact News maintains editorial independence in the gathering, verification and
        publication of news. Our editorial decisions are guided by journalistic standards and the
        public interest, not by political parties, advertisers, commercial interests or other
        external pressures.
      </p>

      <p>
        Advertisers, partners and other organisations do not determine our editorial coverage. Where
        commercial relationships exist, they are kept separate from our editorial decision-making.
      </p>

      <h2>Accuracy and Verification</h2>
      <p>
        We make reasonable efforts to verify information before publication. Our journalists and
        editors assess available evidence, identify credible sources and seek confirmation where
        necessary, particularly for sensitive or consequential claims.
      </p>

      <p>
        We distinguish between verified facts, allegations, opinions, commentary and analysis. When
        information cannot be independently confirmed, we make that clear to our readers rather than
        presenting unverified claims as established facts.
      </p>

      <h2>Fairness and Right of Reply</h2>
      <p>
        ClearFact News is committed to fair and responsible reporting. When a person, organisation
        or institution is the subject of serious allegations or criticism, we seek their response
        where reasonably possible and include relevant responses in our reporting.
      </p>

      <p>
        We do not deliberately distort statements, remove important context or present allegations
        as convictions or established facts.
      </p>

      <h2>Corrections and Accountability</h2>
      <p>
        Despite our commitment to accuracy, mistakes can sometimes occur. When we identify a
        significant factual error, we take reasonable steps to correct it promptly and
        transparently.
      </p>

      <p>
        We believe accountability strengthens journalism and public trust. Readers who identify a
        potential error or have concerns about a published report are encouraged to contact the
        newsroom.
      </p>

      <h2>Public Interest</h2>
      <p>
        Our journalism is guided by the public interest. We cover issues that affect communities and
        contribute to public understanding, including politics, governance, society, business,
        education, health, security, technology, environment, culture and other important
        developments.
      </p>

      <h2>Our Core Values</h2>
      <ul>
        <li>Accuracy and Verification</li>
        <li>Editorial Independence</li>
        <li>Fairness and Balance</li>
        <li>Transparency and Accountability</li>
        <li>Integrity and Professionalism</li>
        <li>Public Interest and Service</li>
        <li>Speed with Verification</li>
        <li>Respect for Human Dignity</li>
      </ul>

      <h2>Our Commitment to Readers</h2>
      <p>
        ClearFact News exists to serve its readers with journalism that is useful, understandable
        and trustworthy. We will continue to improve our reporting practices, strengthen
        verification and listen to legitimate feedback from our audience.
      </p>

      <p>
        Our goal is not simply to publish news quickly, but to help people understand what happened,
        why it matters and what the available facts show.
      </p>

      <h2>Headquarters</h2>
      <p>32 Demsawo, Jimeta, Yola, Adamawa State, Nigeria.</p>
    </SimplePage>
  ),
});
