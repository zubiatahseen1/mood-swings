import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { kindOf, type ApiErrorKind } from "@/lib/errors";

const ERROR_COPY: Record<ApiErrorKind, [string, string]> = {
  config: ["No API key", "Add TMDB_API_KEY to .env.local, then restart the dev server."],
  network: ["No connection", "We could not reach TMDB. Check your network and try again."],
  ratelimit: ["Too many requests", "TMDB is rate-limiting us. Wait a few seconds, then try again."],
  notfound: ["Not found", "That title is not in TMDB any more."],
  server: ["TMDB is having trouble", "The movie database returned an error. This is on their end."],
  invalid: ["That link looks wrong", "Some of the details in this address are not valid."],
};

interface StateMessageProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  role?: "alert";
}

export function StateMessage({ title, children, action, role }: StateMessageProps) {
  return (
    <div role={role} className="mx-auto max-w-md py-16 text-center" data-testid="state-message">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children && <p className="mt-2 text-muted-foreground">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** "Something went wrong" is not an error message: say what actually happened. */
export function ErrorMessage({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const [title, detail] = ERROR_COPY[kindOf(error)];
  return (
    <StateMessage role="alert" title={title} action={onRetry && <Button onClick={onRetry}>Try again</Button>}>
      {detail}
    </StateMessage>
  );
}
