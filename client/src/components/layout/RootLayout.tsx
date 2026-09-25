import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { PageLoader } from "./PageLoader";
import { PageTransition } from "./PageTransition";
import { RoyalHeader } from "./RoyalHeader";
import { SiteFooter } from "./SiteFooter";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function RootLayout() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* One photograph behind the whole home page; the laid table behind every
          other page. Fixed, so it stays put while the content scrolls over it. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-wood-deep bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${isLanding ? "/hero/home-bg.webp" : "/hero/table-bg.webp"}')` }}
      />
      <div aria-hidden="true" className={`fixed inset-0 -z-10 ${isLanding ? "bg-black/25" : "bg-black/45"}`} />

      <ScrollToTop />
      <PageLoader />

      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <RoyalHeader />

      <main id="main" className={isLanding ? "flex-1" : "flex-1 pt-28 pb-10 sm:pt-32"}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <SiteFooter />
    </div>
  );
}
