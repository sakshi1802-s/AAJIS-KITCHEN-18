import { ClipboardList, MessageSquareQuote, UtensilsCrossed } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/owner", label: "Orders", Icon: ClipboardList, end: true },
  { to: "/owner/menu", label: "My menu", Icon: UtensilsCrossed, end: false },
  { to: "/owner/reviews", label: "Reviews", Icon: MessageSquareQuote, end: false },
];

/**
 * Aaji's shell. She is not a power user and she may be holding a phone: three
 * tabs, large text, thumb-sized targets, nothing else on the screen.
 *
 * The tabs run down the left on a wide screen and slide in from that edge,
 * one after the other. On a phone there is no room for a column, so they sit
 * across the top as before.
 */
export function OwnerLayout() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
        <nav
          aria-label="Dashboard"
          className="grid shrink-0 grid-cols-3 gap-2 sm:w-52 sm:grid-cols-1 sm:gap-2.5 sm:self-start"
        >
          {TABS.map(({ to, label, Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ animationDelay: `${i * 90}ms` }}
              className={({ isActive }) =>
                cn(
                  "owner-tab flex items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-base font-semibold transition-colors sm:justify-start sm:px-4 sm:text-lg",
                  isActive ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
