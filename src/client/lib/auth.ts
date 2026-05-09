export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const TOKEN_STORAGE_KEY = "homeboard-token";

export type TokenBootstrapResult =
  | { ok: true; token: string }
  | { ok: false };

export function initializeToken(
  currentUrl: URL,
  storage: StorageLike,
  replaceUrl: (nextUrl: string) => void
): TokenBootstrapResult {
  const queryToken = normalizeToken(currentUrl.searchParams.get("token"));

  if (queryToken) {
    storage.setItem(TOKEN_STORAGE_KEY, queryToken);
    currentUrl.searchParams.delete("token");
    const normalizedUrl = `${currentUrl.pathname}${currentUrl.search ? `?${currentUrl.searchParams.toString()}` : ""}${currentUrl.hash}`;
    replaceUrl(normalizedUrl);
    return {
      ok: true,
      token: queryToken
    };
  }

  const storedToken = normalizeToken(storage.getItem(TOKEN_STORAGE_KEY));
  if (storedToken) {
    return {
      ok: true,
      token: storedToken
    };
  }

  return { ok: false };
}

export function createAuthHeaders(token: string): HeadersInit {
  return {
    authorization: `Bearer ${token}`
  };
}

function normalizeToken(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  // Tokens often come from base64-like secrets. In query strings, "+" is decoded as a space,
  // so normalize whitespace back to "+" before storing or sending the bearer token.
  return trimmed.replace(/\s+/g, "+");
}
