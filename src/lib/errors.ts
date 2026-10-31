export type ApiErrorKind = "config" | "network" | "notfound" | "ratelimit" | "server" | "invalid";

/** Errors carry a `kind` so the UI can say something specific. */
export class ApiError extends Error {
  kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message = kind) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export const STATUS_FOR_KIND: Record<ApiErrorKind, number> = {
  config: 500,
  network: 502,
  notfound: 404,
  ratelimit: 429,
  server: 502,
  invalid: 400,
};

export function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "config";
  if (status === 404) return "notfound";
  if (status === 429) return "ratelimit";
  if (status === 400) return "invalid";
  return "server";
}

const KINDS: ApiErrorKind[] = ["config", "network", "notfound", "ratelimit", "server", "invalid"];

/**
 * Reads the kind back from any error. Errors can cross a cache or network
 * boundary as plain objects, so this checks the message as well as the class.
 */
export function kindOf(error: unknown): ApiErrorKind {
  if (error instanceof ApiError) return error.kind;
  const message = error instanceof Error ? error.message : String(error);
  return KINDS.find((kind) => message === kind) ?? "server";
}
