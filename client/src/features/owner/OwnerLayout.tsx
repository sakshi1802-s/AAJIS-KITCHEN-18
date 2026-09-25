import { ClipboardList, MessageSquareQuote, UtensilsCrossed } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/owner", label: "Orders", Icon: ClipboardList, end: true },
  { to: "/owner/menu", label: "My menu", Icon: UtensilsCrossed, end: false },
  { to: "/owner/reviews", label: "Reviews", Icon: MessageSquareQuote, end: false },
];

/**
 * Aaji's shell. She is not a power user and she's holding a phone: three
 * tabs, large text, thumb-sized targets, nothing else on the screen.
 */
export function OwnerLayout() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <nav aria-label="Dashboard" className="mb-6 grid grid-cols-3 gap-2">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-base font-semibold transition-colors sm:text-lg",
                isActive ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              )
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
