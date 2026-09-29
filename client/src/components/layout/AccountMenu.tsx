import { ChefHat, LogOut, Receipt, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import { Curtain } from "./Curtain";
import { randomSlogan } from "./slogans";

/** `onHero` sits this over the photograph, where the styling has to be light. */
export function AccountMenu({ onHero = false }: { onHero?: boolean }) {
  const { user, isLoading, isOwner, signOut } = useAuth();
  // Signing out clears a cookie, a cache and the plate; the curtain covers
  // that rather than letting the header flicker through it.
  const [leaving, setLeaving] = useState<string | null>(null);
  const navigate = useNavigate();

  if (isLoading) return <Skeleton className="size-9 rounded-full" />;

  if (!user) {
    return (
      <Button
        asChild
        variant={onHero ? "ghost" : "outline"}
        size="sm"
        className={cn(
          "h-9 rounded-full px-4 font-royal tracking-wide",
          onHero &&
            "border border-white/30 bg-black/20 text-white backdrop-blur-[3px] [text-shadow:0_2px_10px_rgba(0,0,0,0.85)] hover:bg-white/20 hover:text-white",
        )}
      >
        <Link to="/signin">Sign in</Link>
      </Button>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isOwner ? "sm" : "icon"}
          className={cn(
            "rounded-full font-semibold",
            isOwner ? "h-9 gap-2 px-2.5" : "size-9",
            onHero ? "bg-white/15 text-white hover:bg-white/25" : "bg-secondary text-maroon",
          )}
          aria-label={isOwner ? "Aaji's account" : "Your account"}
        >
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-sm",
              onHero ? "bg-white/25" : "bg-terracotta/15",
            )}
          >
            {initial}
          </span>
          {/* Aaji should never have to guess which account she's in. */}
          {isOwner && <span className="text-xs tracking-wide uppercase">Owner</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate">
          {user.name}
          <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
          <span
            className={cn(
              "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
              isOwner ? "bg-maroon/10 text-maroon" : "bg-secondary text-secondary-foreground",
            )}
          >
            {isOwner ? "Kitchen owner" : "Customer"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isOwner && (
          <DropdownMenuItem asChild>
            <Link to="/owner">
              <ChefHat /> Kitchen dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/orders">
            <Receipt /> My orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account">
            <UserIcon /> Your details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            setLeaving(randomSlogan());
            void signOut().finally(() => {
              void navigate("/");
              // Long enough to read, short enough not to be a wait.
              setTimeout(() => setLeaving(null), 700);
            });
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>

      {leaving && <Curtain slogan={leaving} />}
    </DropdownMenu>
  );
}
