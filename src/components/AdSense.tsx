import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const ADSENSE_CLIENT = "ca-pub-8967021504063466";
const ADSENSE_SLOT = "9755481370";

export default function AdSense() {
  const containerRef = useRef<HTMLDivElement>(null);

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

        if (ad.getAttribute("data-adsbygoogle-status")) {
          return;
        }

        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        // Ad blockers, offline readers, or unavailable AdSense
        // should never break the article experience.
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      displayAd();

      return () => {
        active = false;
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
      observer.disconnect();
      adStatusObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="mt-10 w-full" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="rectangle"
        data-full-width-responsive="true"
      />
    </div>
  );
}
