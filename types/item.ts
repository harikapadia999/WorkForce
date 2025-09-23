import type { UnitType } from "@/types/employee";

export interface Item {
  id: string;
  userId: string;
  name: string;
  unit: UnitType;
  rate: number;
  tags?: string[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalizes a name to a slug for stable IDs:
 * - lowercase
 * - trim
 * - collapse spaces
 * - replace non-alphanumerics with hyphens
 */
export function makeItemId(name: string, unit: UnitType) {
  const base = (name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "item"}-${unit}`;
}

export const UNIT_OPTIONS: Array<{ label: string; value: UnitType }> = [
  { label: "Piece", value: "piece" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Meter", value: "meter" },
];
