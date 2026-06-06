import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSense() {
  useEffect(() => {
    try {
      window.adsbygoogle =
        window.adsbygoogle || [];

      window.adsbygoogle.push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="my-10">

      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8967021504063466"
        data-ad-slot="7837413984"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>

    </div>
  );
}