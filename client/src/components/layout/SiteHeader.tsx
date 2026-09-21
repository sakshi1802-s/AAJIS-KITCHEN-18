import { Link, NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { CartButton } from "@/features/cart/CartButton";
import { AccountMenu } from "./AccountMenu";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
    isActive ? "text-maroon" : "text-muted-foreground",
  );

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <BrandMark />
          <span className="font-heading text-lg font-semibold text-maroon sm:text-xl">Aji's Kitchen</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Main" className="flex items-center">
            <NavLink to="/menu" className={navLinkClass}>
              Menu
            </NavLink>
            <NavLink to="/plan" className={navLinkClass}>
              Plan
            </NavLink>
          </nav>
          <ThemeToggle />
          <CartButton />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
