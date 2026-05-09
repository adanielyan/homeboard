const cache = new Map<number, Set<string>>();

export function isUsFederalHoliday(date: string): boolean {
  if (date.length < 4) {
    return false;
  }
  const year = Number(date.slice(0, 4));
  if (!Number.isFinite(year)) {
    return false;
  }
  if (!cache.has(year)) {
    cache.set(year, computeHolidays(year));
  }
  return cache.get(year)!.has(date);
}

export function isWeekendDay(date: string): boolean {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return weekday === 0 || weekday === 6;
}

function computeHolidays(year: number): Set<string> {
  const dates = new Set<string>();

  const addFixed = (month: number, day: number) => {
    const actual = new Date(Date.UTC(year, month - 1, day));
    dates.add(toIso(actual));
    const dow = actual.getUTCDay();
    if (dow === 0) {
      dates.add(toIso(shift(actual, 1)));
    } else if (dow === 6) {
      dates.add(toIso(shift(actual, -1)));
    }
  };

  addFixed(1, 1);
  addFixed(6, 19);
  addFixed(7, 4);
  addFixed(11, 11);
  addFixed(12, 25);

  dates.add(toIso(nthWeekday(year, 1, 1, 3)));
  dates.add(toIso(nthWeekday(year, 2, 1, 3)));
  dates.add(toIso(lastWeekday(year, 5, 1)));
  dates.add(toIso(nthWeekday(year, 9, 1, 1)));
  dates.add(toIso(nthWeekday(year, 10, 1, 2)));
  dates.add(toIso(nthWeekday(year, 11, 4, 4)));

  return dates;
}

function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return new Date(Date.UTC(year, month - 1, 1 + offset + (n - 1) * 7));
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(Date.UTC(year, month, 0));
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return new Date(Date.UTC(year, month - 1, last.getUTCDate() - offset));
}

function shift(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
