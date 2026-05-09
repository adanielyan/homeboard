import worker from "../../src/worker/index";

const env = {
  APP_AUTH_TOKEN: "test-token",
  WEATHER_LATITUDE: "39.0840",
  WEATHER_LONGITUDE: "-77.1528",
  WEATHER_LOCATION_LABEL: "Gaithersburg, Maryland",
  WEATHER_TEMPERATURE_UNIT: "fahrenheit",
  WEATHER_WIND_SPEED_UNIT: "mph",
  WEATHER_PRECIPITATION_UNIT: "inch",
  PRIMARY_TIMEZONE: "America/New_York",
  SECONDARY_TIMEZONE: "America/Los_Angeles",
  PRIMARY_TIMEZONE_LABEL: "Home",
  SECONDARY_TIMEZONE_LABEL: "West Coast",
  DISPLAY_LOCALE: "en-US",
  CALENDAR_ICAL_URL: "https://example.com/calendar.ics",
  ASSETS: {
    fetch: vi.fn(async () => new Response("asset"))
  }
} as unknown as Env;

describe("worker routes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await worker.fetch(new Request("https://example.com/api/config"), env);

    expect(response.status).toBe(401);
  });

  it("returns public config for authenticated requests", async () => {
    const response = await worker.fetch(
      new Request("https://example.com/api/config", {
        headers: {
          authorization: "Bearer test-token"
        }
      }),
      env
    );

    const payload = (await response.json()) as { primaryTimezone: string };
    expect(response.status).toBe(200);
    expect(payload.primaryTimezone).toBe("America/New_York");
  });

  it("returns normalized weather data from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            current: {
              time: "2026-05-09T10:00",
              temperature_2m: 72,
              apparent_temperature: 74,
              relative_humidity_2m: 48,
              precipitation: 0,
              rain: 0,
              showers: 0,
              snowfall: 0,
              weather_code: 2,
              cloud_cover: 32,
              wind_speed_10m: 6,
              wind_gusts_10m: 9,
              is_day: 1
            },
            hourly: {
              time: new Array(10).fill("2026-05-09T11:00"),
              temperature_2m: new Array(10).fill(72),
              apparent_temperature: new Array(10).fill(74),
              precipitation_probability: new Array(10).fill(0),
              precipitation: new Array(10).fill(0),
              weather_code: new Array(10).fill(2),
              cloud_cover: new Array(10).fill(32),
              wind_speed_10m: new Array(10).fill(6),
              wind_gusts_10m: new Array(10).fill(9)
            },
            daily: {
              time: [
                "2026-05-09",
                "2026-05-10",
                "2026-05-11",
                "2026-05-12",
                "2026-05-13",
                "2026-05-14",
                "2026-05-15"
              ],
              temperature_2m_max: new Array(7).fill(78),
              temperature_2m_min: new Array(7).fill(59),
              precipitation_sum: new Array(7).fill(0),
              precipitation_probability_max: new Array(7).fill(10),
              weather_code: new Array(7).fill(2)
            },
            current_units: {
              temperature_2m: "°F",
              precipitation: "in",
              wind_speed_10m: "mph"
            }
          }),
          { status: 200 }
        )
      )
    );

    const response = await worker.fetch(
      new Request("https://example.com/api/weather", {
        headers: {
          authorization: "Bearer test-token"
        }
      }),
      env
    );

    expect(response.status).toBe(200);
    expect(((await response.json()) as { current: { temperature: number } }).current.temperature).toBe(72);
  });

  it("returns grouped calendar data from the API", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T14:00:00.000Z"));

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Test//EN",
      "BEGIN:VEVENT",
      "UID:1",
      "SUMMARY:Team Standup",
      "DTSTART:20260509T180000Z",
      "DTEND:20260509T183000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(ics, { status: 200 })),
    );

    const response = await worker.fetch(
      new Request("https://example.com/api/calendar/events", {
        headers: {
          authorization: "Bearer test-token"
        }
      }),
      env
    );

    const payload = (await response.json()) as { today: { events: unknown[] } };
    expect(response.status).toBe(200);
    expect(payload.today.events).toHaveLength(1);

    vi.useRealTimers();
  });
});
