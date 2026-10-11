import type { Ferrata } from "../types/ferrata";
import type { FerrataCompletion } from "../types/completion";

export const MAX_NOTE_LENGTH = 2000;

export function todayLocal(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function validateCompletion(
  completedAt: string,
  note: string,
): string | null {
  if (!isValidDate(completedAt)) return "Choose a valid completion date.";
  if (completedAt > todayLocal())
    return "The completion date cannot be in the future.";
  if (note.trim().length > MAX_NOTE_LENGTH)
    return `Keep your note within ${MAX_NOTE_LENGTH} characters.`;
  return null;
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
export function isSafeSourceUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseFerrata(id: string, data: unknown): Ferrata {
  if (
    !isRecord(data) ||
    !isText(data.name) ||
    !isText(data.country) ||
    !isText(data.region) ||
    !isText(data.difficulty) ||
    !isText(data.description) ||
    !isNumber(data.difficultyRank) ||
    data.difficultyRank < 0 ||
    !isNumber(data.lengthM) ||
    data.lengthM < 0 ||
    !isSafeSourceUrl(data.sourceUrl) ||
    (data.elevationGainM !== undefined &&
      (!isNumber(data.elevationGainM) || data.elevationGainM < 0)) ||
    (data.latitude !== undefined &&
      (!isNumber(data.latitude) || Math.abs(data.latitude) > 90)) ||
    (data.longitude !== undefined &&
      (!isNumber(data.longitude) || Math.abs(data.longitude) > 180))
  ) {
    throw new Error(`Invalid ferrata document: ${id}`);
  }
  return {
    id,
    name: data.name,
    country: data.country,
    region: data.region,
    difficulty: data.difficulty,
    difficultyRank: data.difficultyRank,
    description: data.description,
    lengthM: data.lengthM,
    sourceUrl: data.sourceUrl,
    elevationGainM: data.elevationGainM,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

export function parseCompletion(
  ferrataId: string,
  data: unknown,
): FerrataCompletion {
  if (
    !isRecord(data) ||
    typeof data.completedAt !== "string" ||
    !isValidDate(data.completedAt) ||
    typeof data.note !== "string" ||
    data.note.length > MAX_NOTE_LENGTH
  ) {
    throw new Error(`Invalid completion document: ${ferrataId}`);
  }
  return { ferrataId, completedAt: data.completedAt, note: data.note };
}
