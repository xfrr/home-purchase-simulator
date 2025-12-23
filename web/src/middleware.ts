// src/middleware.ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "es"],
  defaultLocale: "en",
});

export const config = {
  // Match all pathnames except for internal Next.js/Vercel paths
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
