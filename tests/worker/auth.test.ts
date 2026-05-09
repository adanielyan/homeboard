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

  it("throws when the request is not authorized", () => {
    const request = new Request("https://example.com/api/config", {
      headers: {
        authorization: "Bearer nope"
      }
    });

    expect(() => assertAuthorized(request, env)).toThrowError("Invalid bearer token.");
  });
});
