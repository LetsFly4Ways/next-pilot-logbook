import { ContactConfig, SiteConfig } from "@/types";

/* ==================== [> WEBSITE CONFIG <] ==================== */

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const siteConfig: SiteConfig = {
  name: "NEXT Pilot Logbook",
  author: "LVB-305",
  description: "More flying, less paperwork. ALl in the clouds.",
  keywords: [],
  url: {
    base: APP_URL,
    author: "https://github.com/letsfly4ways/next-pilot-logbook",
  },
  ogImage: `${APP_URL}/og.jpg`,
};

export const contactConfig: ContactConfig = {
  email: "78275518+LVB-305@users.noreply.github.com",
};
