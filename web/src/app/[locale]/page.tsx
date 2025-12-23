import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MainPage from "./PageContent";
import { Analytics } from "@vercel/analytics/next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");

  return {
    title: t("name"),
    description: t("description"),
    appleWebApp: {
      capable: true,
      title: t("name"),
    },
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
        { url: "/favicon.ico" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
  };
}

export default function Page() {
  return (
    <>
      <MainPage />
      <Analytics />
    </>
  );
}
