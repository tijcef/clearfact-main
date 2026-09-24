import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const ADSENSE_SCRIPT_ID = "clearfact-adsense";
const ADSENSE_CLIENT = "ca-pub-8967021504063466";
let adsensePromise: Promise<void> | undefined;

function loadAdsense() {
  if (adsensePromise) {
    return adsensePromise;
  }

  adsensePromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("AdSense script failed to load")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return adsensePromise;
}

export default function AdSense() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let active = true;

    const displayAd = async () => {
      try {
        await loadAdsense();

        if (active) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch {
        // Ad blockers and offline readers should not affect the article.
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      void displayAd();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          void displayAd();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(container);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="mt-10 min-h-24 overflow-hidden" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          textAlign: "center",
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot="9755481370"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
