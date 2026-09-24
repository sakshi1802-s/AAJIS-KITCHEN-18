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
  // The landing page's own photograph fills the screen; every other page sits
  // on the wood, and needs room under the fixed wordmark and navigation.
  const isLanding = pathname === "/";

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* The wooden ground, on every page. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-wood-deep bg-repeat"
        style={{ backgroundImage: "url('/textures/wood-planks.jpg')", backgroundSize: "auto 100%" }}
      />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-black/45" />

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
