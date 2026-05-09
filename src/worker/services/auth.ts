import { HttpError } from "../utils/http";

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function assertAuthorized(request: Request, env: Env): void {
  const token = readBearerToken(request);

  if (!token) {
    throw new HttpError(401, "unauthorized", "Missing bearer token.");
  }

  if (token !== env.APP_AUTH_TOKEN) {
    throw new HttpError(401, "unauthorized", "Invalid bearer token.");
  }
}
