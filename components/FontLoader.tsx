"use client";

import { useEffect } from "react";

/**
 * Loads the Fontshare Satoshi font non-blocking via JS.
 * Prevents the external stylesheet from being render-blocking on mobile.
 */
export default function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap";
    document.head.appendChild(link);
  }, []);

  return null;
}
