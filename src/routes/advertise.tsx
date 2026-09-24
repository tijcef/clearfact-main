import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      {
        title: "Advertise with ClearFact News — Reach Nigeria's Digital Audience",
      },
      {
        name: "description",
        content:
          "Partner with ClearFact News to reach an engaged Nigerian and African audience through digital advertising, sponsored content, newsletters, video and strategic media partnerships.",
      },
      {
        property: "og:title",
        content: "Advertise with ClearFact News",
      },
      {
        property: "og:description",
        content:
          "Reach an engaged Nigerian audience through premium digital advertising, sponsored content and media partnerships.",
      },
      { property: "og:url", content: "https://clearfact.ng/advertise" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/advertise" }],
  }),

  component: () => (
    <SimplePage
      eyebrow="Advertise with ClearFact"
      title="Put Your Brand in Front of an Engaged Nigerian Audience."
      intro="ClearFact News helps brands, organisations and institutions connect with readers through trusted journalism, digital storytelling and premium media partnerships."
    >
      <section>
        <p>
          <strong>ClearFact News</strong> is a digital-first Nigerian news platform focused on
          verified journalism, public-interest reporting and stories that matter to our readers.
        </p>

        <p>
          We work with businesses, government institutions, NGOs, development organisations,
          political and civic organisations, agencies and brands seeking meaningful visibility in
          Nigeria's digital media environment.
        </p>
      </section>

      <section>
        <h2>Why Advertise With ClearFact?</h2>

        <ul>
          <li>
            <strong>Trusted Editorial Environment</strong> — Your brand appears alongside
            professionally produced journalism and clearly identified sponsored content.
          </li>

          <li>
            <strong>Engaged Nigerian Audience</strong> — Reach readers interested in politics,
            business, security, education, technology, entertainment, health and national affairs.
          </li>

          <li>
            <strong>National &amp; Diaspora Reach</strong> — Connect with audiences in Nigeria and
            Nigerians interested in developments at home and abroad.
          </li>

          <li>
            <strong>Multiple Digital Formats</strong> — Choose from display advertising, sponsored
            content, newsletters, video and strategic media partnerships.
          </li>

          <li>
            <strong>Editorial Transparency</strong> — Advertising and sponsored content are clearly
            identified and remain separate from independent editorial decisions.
          </li>
        </ul>
      </section>

      <section>
        <h2>Advertising &amp; Partnership Opportunities</h2>

        <h3>Display Advertising</h3>
        <p>
          Put your brand in front of ClearFact readers through strategically placed digital
          advertising across our website.
        </p>

        <h3>Sponsored Content</h3>
        <p>
          Tell your organisation's story through professionally produced sponsored articles,
          features and branded storytelling.
        </p>

        <h3>Newsletter Sponsorship</h3>
        <p>
          Position your brand within ClearFact's direct audience communication through newsletter
          sponsorship opportunities.
        </p>

        <h3>Video &amp; Social Media Campaigns</h3>
        <p>
          Extend your campaign beyond the website through ClearFact's social media and video
          distribution channels.
        </p>

        <h3>Special Reports &amp; Features</h3>
        <p>
          Partner with ClearFact on thematic reports, public-interest campaigns, industry features
          and special editorial projects.
        </p>

        <h3>Strategic Media Partnerships</h3>
        <p>
          We work with organisations seeking longer-term visibility through integrated digital
          campaigns and media partnerships.
        </p>
      </section>

      <section>
        <h2>Who We Work With</h2>

        <ul>
          <li>Corporate brands and businesses</li>
          <li>Startups and technology companies</li>
          <li>Non-governmental organisations</li>
          <li>Development organisations</li>
          <li>Government institutions and agencies</li>
          <li>Educational institutions</li>
          <li>Financial institutions</li>
          <li>Healthcare organisations</li>
          <li>Professional organisations</li>
          <li>Public-interest and civic organisations</li>
          <li>Advertising and public relations agencies</li>
        </ul>
      </section>

      <section>
        <h2>Our Editorial Independence</h2>

        <p>
          Advertising does not determine our editorial coverage. ClearFact maintains a clear
          distinction between independent journalism and commercial partnerships.
        </p>

        <p>
          Sponsored content and paid partnerships are clearly identified to protect transparency and
          maintain reader trust.
        </p>
      </section>

      <section>
        <h2>Request Our Media Kit</h2>

        <p>
          Our media kit contains current information about our audience, advertising formats,
          campaign opportunities, specifications and partnership options.
        </p>

        <p>For advertising enquiries and the latest media kit, contact:</p>

        <p>
          <strong>Email:</strong> <a href="mailto:advertise@clearfact.ng">advertise@clearfact.ng</a>
        </p>
      </section>

      <section>
        <h2>Let's Build a Campaign That Matters</h2>

        <p>
          Whether you are launching a product, promoting an initiative, building public awareness or
          looking for a trusted Nigerian media partner, ClearFact can help you reach the right
          audience.
        </p>

        <p>
          <strong>ClearFact News</strong>
          <br />
          Verified Journalism From Nigeria
        </p>

        <p>
          <a href="mailto:advertise@clearfact.ng">Contact our advertising team →</a>
        </p>
      </section>
    </SimplePage>
  ),
});
