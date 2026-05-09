import { createAuthHeaders, initializeToken, type StorageLike } from "../../src/client/lib/auth";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("initializeToken", () => {
  it("reads the token from the URL and strips it from the visible address", () => {
    const storage = new MemoryStorage();
    const replacedUrls: string[] = [];

    const result = initializeToken(
      new URL("https://homeboard.danielyan.dev/?token=super-secret&foo=bar"),
      storage,
      (nextUrl) => {
        replacedUrls.push(nextUrl);
      }
    );

    expect(result).toEqual({ ok: true, token: "super-secret" });
    expect(storage.getItem("homeboard-token")).toBe("super-secret");
    expect(replacedUrls).toEqual(["/?foo=bar"]);
  });

  it("replaces a previously saved token when a new query token is provided", () => {
    const storage = new MemoryStorage();
    storage.setItem("homeboard-token", "old-token");

    const result = initializeToken(
      new URL("https://homeboard.danielyan.dev/?token=new-token"),
      storage,
      () => {}
    );

    expect(result).toEqual({ ok: true, token: "new-token" });
    expect(storage.getItem("homeboard-token")).toBe("new-token");
  });

  it("normalizes query tokens where plus signs were decoded into spaces", () => {
    const storage = new MemoryStorage();

    const result = initializeToken(
      new URL("https://homeboard.danielyan.dev/?token=abc+def%2Bghi"),
      storage,
      () => {}
    );

    expect(result).toEqual({ ok: true, token: "abc+def+ghi" });
    expect(storage.getItem("homeboard-token")).toBe("abc+def+ghi");
  });

  it("falls back to the persisted session token", () => {
    const storage = new MemoryStorage();
    storage.setItem("homeboard-token", "persisted");

    const result = initializeToken(new URL("https://homeboard.danielyan.dev/"), storage, () => {});

    expect(result).toEqual({ ok: true, token: "persisted" });
  });

  it("returns a failure result when no token can be found", () => {
    const result = initializeToken(new URL("https://homeboard.danielyan.dev/"), new MemoryStorage(), () => {});

    expect(result).toEqual({ ok: false });
  });

  it("normalizes previously saved tokens that contain spaces", () => {
    const storage = new MemoryStorage();
    storage.setItem("homeboard-token", "abc def ghi");

    const result = initializeToken(new URL("https://homeboard.danielyan.dev/"), storage, () => {});

    expect(result).toEqual({ ok: true, token: "abc+def+ghi" });
  });
});

describe("createAuthHeaders", () => {
  it("formats a bearer token header", () => {
    expect(createAuthHeaders("abc123")).toEqual({
      authorization: "Bearer abc123"
    });
  });
});
