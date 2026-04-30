// Anchored "now" so timestamps are deterministic across reloads.
export const NOW = new Date("2026-04-30T15:00:00.000Z");

export const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86400000).toISOString();

export const daysFromNow = (n: number) =>
  new Date(NOW.getTime() + n * 86400000).toISOString();

export const hoursAgo = (n: number) =>
  new Date(NOW.getTime() - n * 3600000).toISOString();
