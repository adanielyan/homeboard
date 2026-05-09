import { type HourlyTone } from "./hourlyTone";
import { getTemperatureTone } from "./temperatureTone";

export function hourlyToneTextClass(tone: HourlyTone): string {
  switch (tone) {
    case "sun-edge":
      return "text-[#f59ac2]";
    case "night":
      return "text-[#7cb7ff]";
    default:
      return "text-[#ffd15c]";
  }
}

export function temperatureToneTextClass(value: number): string {
  switch (getTemperatureTone(value)) {
    case "freezing":
      return "text-[#4a8dff]";
    case "cold":
      return "text-[#87c7ff]";
    case "warm":
      return "text-[#ffb347]";
    case "hot":
      return "text-[#ff6b6b]";
    default:
      return "text-board-text";
  }
}
