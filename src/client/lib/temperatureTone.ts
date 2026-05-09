export type TemperatureTone =
  | "freezing"
  | "cold"
  | "mild"
  | "warm"
  | "hot";

export function getTemperatureTone(value: number): TemperatureTone {
  if (value < 0) {
    return "freezing";
  }

  if (value <= 14) {
    return "cold";
  }

  if (value <= 29) {
    return "mild";
  }

  if (value <= 35) {
    return "warm";
  }

  return "hot";
}
