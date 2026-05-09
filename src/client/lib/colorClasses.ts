import { type HourlyTone } from "./hourlyTone";
import { getTemperatureTone } from "./temperatureTone";

export function hourlyToneTextClass(tone: HourlyTone): string {
  switch (tone) {
    case "sun-edge":
      return "text-tone-sun-edge";
    case "night":
      return "text-tone-night";
    default:
      return "text-tone-day";
  }
}

export function temperatureToneTextClass(value: number): string {
  switch (getTemperatureTone(value)) {
    case "freezing":
      return "text-temp-freezing";
    case "cold":
      return "text-temp-cold";
    case "warm":
      return "text-temp-warm";
    case "hot":
      return "text-temp-hot";
    default:
      return "text-board-text";
  }
}

const DOT_RULES: ReadonlyArray<{ pattern: RegExp; className: string }> = [
  { pattern: /\b(mama|anush)\b/i, className: "bg-dot-mama" },
  { pattern: /\b(papa|armen)\b/i, className: "bg-dot-papa" },
  { pattern: /\b(margaret|maggie)\b/i, className: "bg-dot-margaret" },
  { pattern: /\barthur\b/i, className: "bg-dot-arthur" },
  { pattern: /\b(elizabeth|liza)\b/i, className: "bg-dot-liza" },
];

export function eventDotClass(title: string): string {
  for (const rule of DOT_RULES) {
    if (rule.pattern.test(title)) {
      return rule.className;
    }
  }
  return "bg-dot-default";
}
