import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — ClearFact News" },
      {
        name: "description",
        content:
          "Join ClearFact News and help build the future of verified journalism in Nigeria. Explore opportunities in investigative reporting, verification, engineering and product design.",
      },
      {
        property: "og:title",
        content: "Careers at ClearFact News",
      },
      {
        property: "og:description",
        content:
          "Join a modern Nigerian newsroom focused on verified journalism, original reporting, accountability and innovation.",
      },
    ],
  }),

  component: () => (
    <SimplePage
      eyebrow="ClearFact Careers"
      title="Build the Future of Verified Journalism in Nigeria."
      intro="We're building a modern, digital-first newsroom focused on verified journalism, original reporting, accountability, technology and public-interest storytelling."
    >
      <section>
        <p>
          At <strong>ClearFact News</strong>, we're looking for journalists,
          editors, designers and technologists who want to help build a
          trusted Nigerian media institution.
        </p>
      </section>

      <section>
        <h2>Open Roles</h2>

        <article>
          <h3>Senior Investigative Reporter</h3>

          <p>
            <strong>Location:</strong> Abuja
            <br />
            <strong>Employment:</strong> Full-time
          </p>

          <p>
            Lead original investigations into issues of public interest,
            including governance, accountability, corruption, public spending
            and social impact.
          </p>

          <h4>What You'll Do</h4>
          <ul>
            <li>Develop investigative story ideas.</li>
            <li>Conduct interviews and field reporting.</li>
            <li>Analyze documents and public records.</li>
            <li>Verify claims and evidence.</li>
            <li>
              Work with editors to produce high-impact investigations.
            </li>
            <li>
              Maintain rigorous source protection and ethical reporting
              standards.
            </li>
          </ul>

          <h4>What We're Looking For</h4>
          <ul>
            <li>Strong investigative journalism experience.</li>
            <li>Excellent writing and interviewing skills.</li>
            <li>Ability to work with documents and data.</li>
            <li>
              Strong understanding of Nigerian politics and public
              institutions.
            </li>
            <li>
              Commitment to accuracy, fairness and ethical journalism.
            </li>
          </ul>
        </article>

        <article>
          <h3>Verification Editor</h3>

          <p>
            <strong>Location:</strong> Yola
            <br />
            <strong>Employment:</strong> Full-time
          </p>

          <p>
            Help make <strong>"Verified Journalism From Nigeria"</strong> more
            than a slogan. You will lead verification of claims, social-media
            reports, images, videos, documents and breaking-news information
            before publication.
          </p>

          <h4>What You'll Do</h4>
          <ul>
            <li>Verify breaking-news claims.</li>
            <li>Conduct source and reverse-image verification.</li>
            <li>Cross-check official records and statements.</li>
            <li>Identify manipulated or misleading information.</li>
            <li>Work with reporters before publication.</li>
            <li>Maintain ClearFact's verification standards.</li>
          </ul>

          <h4>What We're Looking For</h4>
          <ul>
            <li>
              Background in journalism, communications, research or a related
              field.
            </li>
            <li>Strong digital verification skills.</li>
            <li>Excellent attention to detail.</li>
            <li>
              Ability to work quickly under breaking-news pressure.
            </li>
            <li>
              Strong understanding of Nigeria's information ecosystem.
            </li>
          </ul>
        </article>

        <article>
          <h3>Frontend Engineer — React/TanStack</h3>

          <p>
            <strong>Location:</strong> Remote
            <br />
            <strong>Employment:</strong> Full-time / Contract
          </p>

          <p>
            Help build the technology powering the next generation of ClearFact
            journalism.
          </p>

          <h4>What You'll Do</h4>
          <ul>
            <li>Develop and maintain ClearFact's frontend.</li>
            <li>Build high-performance digital news experiences.</li>
            <li>Work with React and TanStack technologies.</li>
            <li>Integrate APIs and CMS infrastructure.</li>
            <li>Improve performance, accessibility and SEO.</li>
            <li>
              Build tools that support newsroom workflows and content
              distribution.
            </li>
          </ul>

          <h4>What We're Looking For</h4>
          <ul>
            <li>Strong React experience.</li>
            <li>Experience with TanStack technologies.</li>
            <li>Proficiency in modern JavaScript/TypeScript.</li>
            <li>API integration experience.</li>
            <li>
              Understanding of web performance and technical SEO.
            </li>
            <li>Strong attention to product quality.</li>
          </ul>
        </article>

        <article>
          <h3>Newsroom Product Designer</h3>

          <p>
            <strong>Location:</strong> Remote
            <br />
            <strong>Employment:</strong> Full-time / Contract
          </p>

          <p>
            Design the digital experiences that connect ClearFact journalism
            with millions of readers.
          </p>

          <h4>What You'll Do</h4>
          <ul>
            <li>Design web and mobile newsroom experiences.</li>
            <li>Develop UI/UX systems.</li>
            <li>Design homepage, article and discovery experiences.</li>
            <li>Create prototypes for newsroom products.</li>
            <li>Collaborate with journalists, editors and engineers.</li>
            <li>
              Develop and maintain a consistent ClearFact design language.
            </li>
          </ul>

          <h4>What We're Looking For</h4>
          <ul>
            <li>Strong UI/UX portfolio.</li>
            <li>Experience designing digital products.</li>
            <li>Excellent visual and interaction design skills.</li>
            <li>Understanding of responsive design.</li>
            <li>Strong communication and collaboration skills.</li>
          </ul>
        </article>
      </section>

      <section>
        <h2>Why ClearFact?</h2>

        <h3>Do Meaningful Work</h3>
        <p>
          Our journalism focuses on stories that matter to people and
          communities.
        </p>

        <h3>Build Something New</h3>
        <p>
          We're building a digital-first newsroom designed for the way people
          consume information today.
        </p>

        <h3>Work Across Disciplines</h3>
        <p>
          Journalists, researchers, designers and engineers work together to
          create better journalism.
        </p>

        <h3>Grow With the Newsroom</h3>
        <p>
          As ClearFact grows, team members will have opportunities to take
          ownership of projects and develop professionally.
        </p>
      </section>

      <section>
        <h2>Our Newsroom Principles</h2>

        <ul>
          <li>
            <strong>Accuracy:</strong> We verify before we publish.
          </li>
          <li>
            <strong>Independence:</strong> Our journalism is guided by public
            interest, not political or commercial pressure.
          </li>
          <li>
            <strong>Fairness:</strong> We clearly distinguish allegations,
            claims and verified facts.
          </li>
          <li>
            <strong>Transparency:</strong> We correct errors and explain our
            editorial processes.
          </li>
          <li>
            <strong>Innovation:</strong> We use technology, data and modern
            storytelling to improve journalism.
          </li>
          <li>
            <strong>Impact:</strong> We focus on journalism that informs
            communities and strengthens accountability.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to Apply</h2>

        <p>
          Send your application to{" "}
          <a href="mailto:careers@clearfact.ng">
            careers@clearfact.ng
          </a>
        </p>

        <h3>Editorial Roles</h3>
        <ul>
          <li>CV</li>
          <li>3–5 journalism clips</li>
          <li>Short cover letter</li>
          <li>Links to published work</li>
        </ul>

        <h3>Engineering &amp; Design Roles</h3>
        <ul>
          <li>CV</li>
          <li>Portfolio or GitHub</li>
          <li>Relevant project links</li>
          <li>Short cover letter</li>
        </ul>

        <p>
          <strong>Email subject:</strong> Application — [Position Title]
        </p>

        <p>
          Examples:
          <br />
          Application — Senior Investigative Reporter
          <br />
          Application — Verification Editor
          <br />
          Application — Frontend Engineer
          <br />
          Application — Newsroom Product Designer
        </p>
      </section>

      <section>
        <h2>Join ClearFact</h2>

        <p>
          If you're passionate about{" "}
          <strong>
            truth, accountability, innovation and public-interest journalism
          </strong>
          , we want to hear from you.
        </p>

        <p>
          <strong>ClearFact News</strong>
          <br />
          Verified Journalism From Nigeria
        </p>
      </section>
    </SimplePage>
  ),
});