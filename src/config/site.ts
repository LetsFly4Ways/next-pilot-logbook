import { ContactConfig, SiteConfig } from "@/types";

/* ==================== [> WEBSITE CONFIG <] ==================== */

const baseUrl = "http://localhost:3000/";

export const siteConfig: SiteConfig = {
  name: "NEXT Pilot Logbook",
  author: "LVB-305",
  description: "More flying, less paperwork. ALl in the clouds.",
  keywords: [],
  url: {
    base: baseUrl,
    author: "https://github.com/letsfly4ways/next-pilot-logbook",
  },
  ogImage: `${baseUrl}/og.jpg`,
};

export const contactConfig: ContactConfig = {
  email: "78275518+LVB-305@users.noreply.github.com",
};
