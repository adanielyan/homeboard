import { assertAuthorized } from "./services/auth";
import { getCalendarEvents } from "./services/calendar";
import { getAppConfig } from "./services/config";
import { getWeather } from "./services/weather";
import { handleRouteError, json } from "./utils/http";

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  assertAuthorized(request, env);

  const url = new URL(request.url);

  if (request.method !== "GET") {
    return new Response(null, {
      status: 405,
      headers: {
        allow: "GET"
      }
    });
  }

  if (url.pathname === "/api/config") {
    return json(getAppConfig(env));
  }

  if (url.pathname === "/api/weather") {
    return json(await getWeather(env));
  }

  if (url.pathname === "/api/calendar/events") {
    return json(await getCalendarEvents(env));
  }

  return json(
    {
      error: "not_found",
      message: "API route not found.",
      status: 404
    },
    { status: 404 }
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(request, env);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      return handleRouteError(error);
    }
  }
};
