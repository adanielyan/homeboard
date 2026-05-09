import type { CalendarDayGroup, CalendarEvent, CalendarEventsResponse } from "../../shared/types";
import { MemoryCache } from "../utils/cache";
import { HttpError } from "../utils/http";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const CALENDAR_CACHE_TTL_MS = 5 * 60 * 1000;
const ACCESS_TOKEN_SAFETY_BUFFER_MS = 60 * 1000;

const calendarCache = new MemoryCache();
const tokenCache = new MemoryCache();

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    date?: string;
    dateTime?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
}

interface GoogleCalendarResponse {
  items?: GoogleCalendarEvent[];
}

export async function getCalendarEvents(env: Env): Promise<CalendarEventsResponse> {
  const cacheKey = `${env.GOOGLE_CALENDAR_ID}:${env.PRIMARY_TIMEZONE}:${env.DISPLAY_LOCALE || "en-US"}`;
  const cached = calendarCache.get<CalendarEventsResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const accessToken = await getGoogleAccessToken(env);
  const configLocale = env.DISPLAY_LOCALE || "en-US";
  const timeZone = env.PRIMARY_TIMEZONE;
  const { timeMin, timeMax } = createCalendarWindow(timeZone);
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events`
  );
  url.search = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    timeMin,
    timeMax,
    timeZone,
    maxResults: "50"
  }).toString();

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new HttpError(502, "calendar_upstream_error", "Unable to load calendar events.");
  }

  const payload = (await response.json()) as GoogleCalendarResponse;
  const normalized = normalizeCalendarResponse(payload, timeZone, configLocale);
  calendarCache.set(cacheKey, normalized, CALENDAR_CACHE_TTL_MS);
  return normalized;
}

export function createCalendarWindow(timeZone: string, now = new Date()): { timeMin: string; timeMax: string } {
  const startOfDay = zonedDayToUtc(timeZone, formatZonedDate(now, timeZone));
  const endOfWindow = new Date(startOfDay.getTime() + 8 * 24 * 60 * 60 * 1000);

  return {
    timeMin: startOfDay.toISOString(),
    timeMax: endOfWindow.toISOString()
  };
}

export function normalizeCalendarResponse(
  payload: GoogleCalendarResponse,
  timeZone: string,
  locale: string
): CalendarEventsResponse {
  const groups = new Map<string, CalendarEvent[]>();
  const todayDate = formatZonedDate(new Date(), timeZone);

  for (let offset = 0; offset <= 7; offset += 1) {
    const date = shiftDate(todayDate, offset);
    groups.set(date, []);
  }

  for (const item of payload.items || []) {
    const normalized = normalizeCalendarEvent(item, timeZone);
    if (!normalized) {
      continue;
    }

    const key = normalized.isAllDay ? normalized.start.slice(0, 10) : formatZonedDate(new Date(normalized.start), timeZone);
    if (!groups.has(key)) {
      continue;
    }

    groups.get(key)?.push(normalized);
  }

  const orderedDates = [...groups.keys()].sort();
  const dayGroups: CalendarDayGroup[] = orderedDates.map((date) => ({
    date,
    events: (groups.get(date) || []).sort(compareEvents(locale, timeZone))
  }));

  return {
    today: dayGroups[0] || { date: todayDate, events: [] },
    upcomingDays: dayGroups.slice(1)
  };
}

export function normalizeCalendarEvent(item: GoogleCalendarEvent, timeZone: string): CalendarEvent | null {
  const title = item.summary?.trim() || "Untitled event";
  const isAllDay = Boolean(item.start?.date && item.end?.date);
  const start = item.start?.dateTime || item.start?.date;
  const end = item.end?.dateTime || item.end?.date;

  if (!start || !end) {
    return null;
  }

  const normalizedStart = isAllDay ? `${item.start?.date}T00:00:00.000Z` : start;
  const normalizedEnd = isAllDay
    ? `${shiftDate(item.end?.date || item.start?.date || "", -1)}T23:59:59.999Z`
    : end;

  return {
    id: item.id,
    title,
    start: normalizedStart,
    end: normalizedEnd,
    isAllDay,
    description: item.description,
    location: item.location
  };
}

async function getGoogleAccessToken(env: Env): Promise<string> {
  const cached = tokenCache.get<string>("google_access_token");
  if (cached) {
    return cached;
  }

  const assertion = await createJwtAssertion(env);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }).toString()
  });

  if (!response.ok) {
    throw new HttpError(502, "google_auth_error", "Unable to authenticate with Google Calendar.");
  }

  const payload = (await response.json()) as GoogleTokenResponse;
  tokenCache.set(
    "google_access_token",
    payload.access_token,
    Math.max((payload.expires_in * 1000) - ACCESS_TOKEN_SAFETY_BUFFER_MS, 60 * 1000)
  );
  return payload.access_token;
}

async function createJwtAssertion(env: Env): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 3600;
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: CALENDAR_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: expiresAt,
      iat: issuedAt
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = await signJwt(unsignedToken, env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  return `${unsignedToken}.${signature}`;
}

async function signJwt(input: string, privateKeyPem: string): Promise<string> {
  const normalizedKey = privateKeyPem.replace(/\\n/g, "\n");
  const keyData = pemToArrayBuffer(normalizedKey);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(input));
  return base64UrlEncode(signature);
}

function base64UrlEncode(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function compareEvents(locale: string, timeZone: string) {
  return (left: CalendarEvent, right: CalendarEvent): number => {
    if (left.isAllDay !== right.isAllDay) {
      return left.isAllDay ? -1 : 1;
    }

    const leftTime = left.isAllDay ? left.start : formatEventSortKey(left.start, locale, timeZone);
    const rightTime = right.isAllDay ? right.start : formatEventSortKey(right.start, locale, timeZone);

    return leftTime.localeCompare(rightTime);
  };
}

function formatEventSortKey(value: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone
  }).format(new Date(value));
}

export function formatZonedDate(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new HttpError(500, "date_format_error", "Unable to format date.");
  }

  return `${year}-${month}-${day}`;
}

export function shiftDate(dateString: string, days: number): string {
  if (!dateString) {
    return dateString;
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function zonedDayToUtc(timeZone: string, dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const utcCandidate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  for (let hour = -14; hour <= 14; hour += 1) {
    const candidate = new Date(utcCandidate.getTime() - hour * 60 * 60 * 1000);
    if (formatZonedDate(candidate, timeZone) === dateString) {
      const hourInZone = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        hour12: false,
        timeZone
      }).format(candidate);

      if (hourInZone === "00" || hourInZone === "24") {
        return candidate;
      }
    }
  }

  return utcCandidate;
}
