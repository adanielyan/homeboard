import { assertAuthorized, readBearerToken } from "../../src/worker/services/auth";

describe("worker auth", () => {
  const env = {
    APP_AUTH_TOKEN: "shhh"
  } as Env;

  it("reads bearer tokens from the authorization header", () => {
    const request = new Request("https://example.com/api/config", {
      headers: {
        authorization: "Bearer shhh"
      }
    });

    expect(readBearerToken(request)).toBe("shhh");
  });

  it("tolerates extra surrounding whitespace in the authorization header", () => {
    const request = new Request("https://example.com/api/config", {
      headers: {
        authorization: "  Bearer   shhh  "
      }
    });

    expect(readBearerToken(request)).toBe("shhh");
  });

  it("throws when the request is not authorized", () => {
    const request = new Request("https://example.com/api/config", {
      headers: {
        authorization: "Bearer nope"
      }
    });

    expect(() => assertAuthorized(request, env)).toThrowError("Invalid bearer token.");
  });

  it("throws a configuration error when the worker token is missing", () => {
    const request = new Request("https://example.com/api/config", {
      headers: {
        authorization: "Bearer shhh"
      }
    });

    expect(() => assertAuthorized(request, {} as Env)).toThrowError("APP_AUTH_TOKEN is not configured.");
  });

  it("ignores surrounding whitespace in the configured token", () => {
    const request = new Request("https://example.com/api/config", {
      headers: {
        authorization: "Bearer shhh"
      }
    });

    expect(() => assertAuthorized(request, { APP_AUTH_TOKEN: "  shhh  " } as Env)).not.toThrow();
  });
});
