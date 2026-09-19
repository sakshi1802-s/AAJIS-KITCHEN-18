import { CircleAlert, RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/** What broke, in plain words, plus a way to try again. */
export function ErrorState({ title = "Something went wrong", error, onRetry, className }: ErrorStateProps) {
  const isNetwork = error instanceof ApiError && error.code === "NETWORK";
  const message =
    error instanceof ApiError ? error.message : "An unexpected error occurred. Please try again.";
  const Icon = isNetwork ? WifiOff : CircleAlert;

  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="lg" onClick={onRetry} className="mt-2">
          <RotateCcw /> Try again
        </Button>
      )}
    </div>
  );
}
