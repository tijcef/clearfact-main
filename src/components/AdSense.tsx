import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "@/lib/site-config";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSenseProps = {
  className?: string;
};

export default function AdSense({ className = "" }: AdSenseProps) {
  const containerRef = useRef<HTMLElement>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let active = true;
    const ad = container.querySelector<HTMLElement>(".adsbygoogle");

    if (!ad) {
      return;
    }

    const syncAdVisibility = () => {
      const isUnfilled = ad.getAttribute("data-ad-status") === "unfilled";

      container.hidden = isUnfilled;
      container.classList.toggle("mt-0", isUnfilled);
      container.classList.toggle("mt-10", !isUnfilled);
    };

    const adStatusObserver = new MutationObserver(syncAdVisibility);

    adStatusObserver.observe(ad, {
      attributes: true,
      attributeFilter: ["data-ad-status", "data-adsbygoogle-status"],
    });

    const displayAd = () => {
      try {
        if (!active) {
          return;
        }

        const adScript = document.querySelector(
          'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
        );

        if (!adScript) {
          return;
        }

        if (requestedRef.current || ad.getAttribute("data-adsbygoogle-status")) {
          return;
        }

        requestedRef.current = true;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        requestedRef.current = false;
        // Ad blockers, offline readers, or unavailable AdSense
        // should never break the article experience.
      }
    };

    const unresolvedAdTimeout = window.setTimeout(() => {
      if (
        !ad.getAttribute("data-ad-status") &&
        !ad.getAttribute("data-adsbygoogle-status")
      ) {
        container.hidden = true;
      }
    }, 20_000);

    if (typeof IntersectionObserver === "undefined") {
      displayAd();

      return () => {
        active = false;
        window.clearTimeout(unresolvedAdTimeout);
        adStatusObserver.disconnect();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          displayAd();
        }
      },
      {
        rootMargin: "600px 0px",
      },
    );

    observer.observe(container);

    return () => {
      active = false;
      window.clearTimeout(unresolvedAdTimeout);
      observer.disconnect();
      adStatusObserver.disconnect();
    };
  }, []);

  return (
    <aside
      ref={containerRef}
      className={`mt-10 min-h-[250px] w-full overflow-hidden ${className}`.trim()}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
