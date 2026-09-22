import { ChefHat, LogOut, Receipt, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
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

/** `onHero` sits this over the photograph, where the styling has to be light. */
export function AccountMenu({ onHero = false }: { onHero?: boolean }) {
  const { user, isLoading, isOwner, signOut } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <Skeleton className="size-9 rounded-full" />;

  if (!user) {
    return (
      <Button
        asChild
        variant={onHero ? "ghost" : "outline"}
        size="sm"
        className={cn("h-9 rounded-full px-4", onHero && "text-white hover:bg-white/15 hover:text-white")}
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
          aria-label={isOwner ? "Aji's account" : "Your account"}
        >
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-sm",
              onHero ? "bg-white/25" : "bg-terracotta/15",
            )}
          >
            {initial}
          </span>
          {/* Aji should never have to guess which account she's in. */}
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
            void signOut().then(() => {
              toast.success("Signed out");
              void navigate("/");
            });
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
