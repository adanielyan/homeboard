import type { AppConfig } from "../../shared/types";

export interface ClockFace {
  timeLabel: string;
  preciseTimeLabel: string;
  dateLabel: string;
}

export interface ClockSnapshot {
  primary: ClockFace;
  secondary: ClockFace;
}

export class CurrentTimeService {
  private timer: number | null = null;

  constructor(private readonly config: AppConfig) {}

  subscribe(listener: (snapshot: ClockSnapshot) => void): () => void {
    const emit = () => listener(buildClockSnapshot(new Date(), this.config));

    emit();
    this.timer = window.setInterval(emit, this.config.clockTickIntervalMs);

    return () => {
      if (this.timer !== null) {
        window.clearInterval(this.timer);
      }
    };
  }
}

export function buildClockSnapshot(now: Date, config: AppConfig): ClockSnapshot {
  return {
    primary: {
      timeLabel: formatTime(now, config.locale, config.primaryTimezone),
      preciseTimeLabel: formatTime(now, config.locale, config.primaryTimezone, true),
      dateLabel: formatDate(now, config.locale, config.primaryTimezone)
    },
    secondary: {
      timeLabel: formatTime(now, config.locale, config.secondaryTimezone),
      preciseTimeLabel: formatTime(now, config.locale, config.secondaryTimezone, true),
      dateLabel: formatDate(now, config.locale, config.secondaryTimezone)
    }
  };
}

function formatDate(value: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone
  }).format(value);
}

function formatTime(value: Date, locale: string, timeZone: string, includeSeconds = false): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: true,
    timeZone
  }).format(value);
}
