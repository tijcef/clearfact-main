import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdBannerProps = {
  className?: string;
};

export default function AdBanner({ className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    const loadAd = () => {
      try {
        if (!adRef.current) return;

        const ads = window.adsbygoogle || [];

        ads.push({});

        window.adsbygoogle = ads;
      } catch (error) {
        console.error("AdSense error:", error);
      }
    };

    if (typeof window === "undefined") return;

    loadAd();
  }, []);

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      aria-label="Advertisement"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          minHeight: "100px",
        }}
        data-ad-client="ca-pub-8967021504063466"
        data-ad-slot="9755481370"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}