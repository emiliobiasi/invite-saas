export function now(): Date {
  return new Date();
}

export function toIso(date: Date): string {
  return date.toISOString();
}
