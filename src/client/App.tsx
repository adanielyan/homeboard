import { useEffect, useMemo, useState } from "preact/hooks";
import {
  MAX_TODAY_EVENTS,
  MAX_UPCOMING_EVENTS_PER_DAY,
} from "../shared/constants";
import type {
  AppConfig,
  CalendarEventsResponse,
  WeatherResponse,
} from "../shared/types";
import { CalendarEventList } from "./components/CalendarEventList";
import { MiniMonthCalendars } from "./components/MiniMonthCalendars";
import { UpcomingCalendar } from "./components/UpcomingCalendar";
import { WeatherCard } from "./components/WeatherCard";
import { WeatherForecast } from "./components/WeatherForecast";
import { WeatherHourlyStrip } from "./components/WeatherHourlyStrip";
import { createAuthHeaders, initializeToken } from "./lib/auth";
import { ApiClient } from "./services/apiClient";
import { CalendarService } from "./services/calendarService";
import {
  CurrentTimeService,
  type ClockSnapshot,
} from "./services/currentTimeService";
import { WeatherService } from "./services/weatherService";
import { sectionPanelClassName } from "./components/SectionFrame";

type BootstrapState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      token: string;
      apiClient: ApiClient;
      config: AppConfig;
    };

function App() {
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>({
    status: "loading",
  });
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [calendar, setCalendar] = useState<CalendarEventsResponse | null>(null);
  const [clock, setClock] = useState<ClockSnapshot | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  useEffect(() => {
    const result = initializeToken(
      new URL(window.location.href),
      window.sessionStorage,
      (nextUrl) => {
        window.history.replaceState({}, "", nextUrl);
      },
    );

    if (!result.ok) {
      setBootstrapState({
        status: "error",
        message:
          "Open the board with a valid ?token=... query parameter at least once on this device.",
      });
      return;
    }

    const apiClient = new ApiClient(createAuthHeaders(result.token));
    apiClient
      .getConfig()
      .then((config) => {
        setBootstrapState({
          status: "ready",
          token: result.token,
          apiClient,
          config,
        });
      })
      .catch((error: unknown) => {
        setBootstrapState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load board configuration.",
        });
      });
  }, []);

  useEffect(() => {
    if (bootstrapState.status !== "ready") {
      return;
    }

    const weatherService = new WeatherService(bootstrapState.apiClient);
    let active = true;

    const loadWeather = async () => {
      try {
        const nextWeather = await weatherService.getWeather();
        if (!active) {
          return;
        }
        setWeather(nextWeather);
        setWeatherError(null);
      } catch (error) {
        if (!active) {
          return;
        }
        setWeatherError(
          error instanceof Error ? error.message : "Unable to load weather.",
        );
      }
    };

    void loadWeather();
    const timer = window.setInterval(
      loadWeather,
      bootstrapState.config.weatherPollIntervalMs,
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [bootstrapState]);

  useEffect(() => {
    if (bootstrapState.status !== "ready") {
      return;
    }

    const calendarService = new CalendarService(bootstrapState.apiClient);
    let active = true;

    const loadCalendar = async () => {
      try {
        const nextCalendar = await calendarService.getEvents();
        if (!active) {
          return;
        }
        setCalendar(nextCalendar);
        setCalendarError(null);
      } catch (error) {
        if (!active) {
          return;
        }
        setCalendarError(
          error instanceof Error ? error.message : "Unable to load calendar.",
        );
      }
    };

    void loadCalendar();
    const timer = window.setInterval(
      loadCalendar,
      bootstrapState.config.calendarPollIntervalMs,
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [bootstrapState]);

  useEffect(() => {
    if (bootstrapState.status !== "ready") {
      return;
    }

    const timeService = new CurrentTimeService(bootstrapState.config);
    const unsubscribe = timeService.subscribe(setClock);
    return unsubscribe;
  }, [bootstrapState]);

  const todayEvents = useMemo(
    () => calendar?.today.events.slice(0, MAX_TODAY_EVENTS) || [],
    [calendar],
  );
  const hiddenTodayEvents = Math.max(
    (calendar?.today.events.length || 0) - todayEvents.length,
    0,
  );

  if (bootstrapState.status === "loading") {
    return (
      <main className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,120,255,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#07111f_0%,#030914_100%)] p-[clamp(10px,1vw,20px)] font-sans text-board-text [letter-spacing:0.014em]">
        <div className={`${sectionPanelClassName} grid h-full place-items-center bg-[rgba(4,12,24,0.7)] text-center`}>
          Loading Homeboard...
        </div>
      </main>
    );
  }

  if (bootstrapState.status === "error") {
    return (
      <main className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,120,255,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#07111f_0%,#030914_100%)] p-[clamp(10px,1vw,20px)] font-sans text-board-text [letter-spacing:0.014em]">
        <div className={`${sectionPanelClassName} grid h-full place-items-center bg-[rgba(4,12,24,0.7)] p-8 text-center`}>
          <h1>Homeboard unavailable</h1>
          <p>{bootstrapState.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,120,255,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#07111f_0%,#030914_100%)] p-[clamp(10px,1vw,20px)] font-sans text-board-text [letter-spacing:0.014em] max-[900px]:p-[10px]">
      <div className="grid h-full gap-[clamp(12px,1vw,20px)] [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] max-[1280px]:grid-cols-1">
        <section className="grid min-h-0 content-start gap-[clamp(12px,1vw,20px)] [grid-template-rows:minmax(16rem,auto)_auto_auto_auto] max-[1500px]:[grid-template-rows:minmax(14rem,auto)_auto_auto_auto] max-[1280px]:[grid-template-rows:minmax(11rem,auto)_auto_auto_auto] [@media(max-height:980px)]:[grid-template-rows:minmax(14rem,auto)_auto_auto_auto]">
          <WeatherCard
            config={bootstrapState.config}
            clock={clock}
            weather={weather}
            error={weatherError}
          />
          <WeatherHourlyStrip weather={weather} error={weatherError} />
          <WeatherForecast weather={weather} error={weatherError} />
          <MiniMonthCalendars config={bootstrapState.config} />
        </section>

        <section className="grid min-h-0 gap-[clamp(12px,1vw,20px)] [grid-template-rows:minmax(0,1fr)_minmax(0,1fr)] max-[1280px]:auto-rows-max max-[1280px]:grid-rows-none">
          <CalendarEventList
            config={bootstrapState.config}
            day={calendar?.today || null}
            events={todayEvents}
            hiddenCount={hiddenTodayEvents}
            error={calendarError}
          />
          <UpcomingCalendar
            config={bootstrapState.config}
            groups={calendar?.upcomingDays || []}
            maxPerDay={MAX_UPCOMING_EVENTS_PER_DAY}
            error={calendarError}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
