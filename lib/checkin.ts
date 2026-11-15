import { I, KEYS, type Day, type Key } from "./health";

// Input bounds prevent malformed entries; these are not medical reference ranges.
export const INPUT_BOUNDS: Record<Key, [number, number]> = {
  hr: [20, 250], bp: [40, 260], glucose: [20, 600], temp: [30, 43], sleep: [0, 24], mood: [1, 10],
};
export type CheckIn = Day & { date: string };
export function validReading(value: unknown): value is Day {
  if (!value || typeof value !== "object") return false;
  const row = value as Day;
  return Number.isInteger(row.day) && row.day > 0 && KEYS.every(k =>
    Number.isFinite(row[k]) && row[k] >= INPUT_BOUNDS[k][0] && row[k] <= INPUT_BOUNDS[k][1]);
}
export function parseHistory(raw: string | null): CheckIn[] {
  if (!raw) return [];
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.every((r, i) => validReading(r) && r.day === i + 1 && "date" in r && typeof r.date === "string")) throw new Error("Saved history is invalid.");
  return rows as CheckIn[];
}
export function saveEntry(history: CheckIn[], values: Record<Key, number>, date: string): CheckIn[] {
  const existing = history.findIndex(row => row.date === date);
  const row = { ...values, day: existing < 0 ? history.length + 1 : existing + 1, date };
  if (!validReading(row)) throw new Error("Check the values and units before saving.");
  return existing < 0 ? [...history, row] : history.map((r, i) => i === existing ? row : r);
}
export const EMPTY_VALUES = Object.fromEntries(KEYS.map(k => [k, I[k].base])) as Record<Key, number>;
