import { Link } from "react-router";
import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <EmptyState
      className="py-24"
      title="This page isn't on the menu"
      description="The link may be old, or the page has moved."
      action={
        <Button asChild size="lg">
          <Link to="/menu">See the menu</Link>
        </Button>
      }
    />
  );
}
