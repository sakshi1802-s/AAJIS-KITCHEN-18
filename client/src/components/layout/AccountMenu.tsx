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

export function AccountMenu() {
  const { user, isLoading, isOwner, signOut } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <Skeleton className="size-9 rounded-full" />;

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="h-9 rounded-full px-4">
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
          size="icon"
          className="size-9 rounded-full bg-secondary font-semibold text-maroon"
          aria-label="Your account"
        >
          {initial}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          {user.name}
          <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isOwner && (
          <DropdownMenuItem asChild>
            <Link to="/owner">
              <ChefHat /> Aji's dashboard
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
