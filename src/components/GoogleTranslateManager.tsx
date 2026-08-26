"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslateManager() {
  const pathname = usePathname() || "";
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    // Never load translation script inside dashboard
    if (isDashboard) return;

    // Reset body and html top inline offsets whenever Google attempts to inject them
    const resetBodyOffset = () => {
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== "0px") {
        document.documentElement.style.top = "0px";
      }
    };

    resetBodyOffset();

    const observer = new MutationObserver(() => {
      resetBodyOffset();
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });

    // Define initialization callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "vi",
            includedLanguages: "vi,en",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Check if script already exists
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      observer.disconnect();
    };
  }, [isDashboard]);

  if (isDashboard) return null;

  return (
    <div
      id="google_translate_element"
      aria-hidden="true"
      style={{ display: "none", position: "absolute", top: "-9999px", left: "-9999px" }}
    />
  );
}
