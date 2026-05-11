import { HttpError } from "../utils/http";

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [scheme, token, ...extra] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
    return null;
  }

  return token;
}

export function assertAuthorized(request: Request, env: Env): void {
  const token = readBearerToken(request);
  const expectedToken = normalizeConfiguredToken(env.APP_AUTH_TOKEN);

  if (!token) {
    throw new HttpError(401, "unauthorized", "Missing bearer token.");
  }

  if (!expectedToken) {
    throw new HttpError(500, "configuration_error", "APP_AUTH_TOKEN is not configured.");
  }

  if (token !== expectedToken) {
    throw new HttpError(401, "unauthorized", "Invalid bearer token.");
  }
}

function normalizeConfiguredToken(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}
