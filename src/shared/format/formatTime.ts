const pad2 = (value: number): string => String(value).padStart(2, '0');

export function formatClockTime(epochMs: number): string {
  const date = new Date(epochMs);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function formatDurationMs(durationMs: number): string {
  return `${Math.max(0, Math.round(durationMs))} ms`;
}
