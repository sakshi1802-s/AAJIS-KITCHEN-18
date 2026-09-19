import { Link, NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
    isActive ? "text-maroon" : "text-muted-foreground",
  );

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <BrandMark />
          <span className="font-heading text-xl font-semibold text-maroon">Aji's Kitchen</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink to="/menu" className={navLinkClass}>
            Menu
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
