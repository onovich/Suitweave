export interface PlayerObservation {
  readonly participantId: string;
  readonly source: "real-player";
  readonly taskVersion: string;
  readonly completedBoards: number;
  readonly crownTriggered: boolean;
  readonly roundsPlayed: number;
  readonly minutesPlayed: number;
  readonly notes?: string;
}

const ALLOWED_KEYS = new Set(["participantId", "source", "taskVersion", "completedBoards", "crownTriggered", "roundsPlayed", "minutesPlayed", "notes"]);
const FORBIDDEN_KEYS = ["name", "email", "phone", "address", "ip", "userId"];

export const validatePlayerObservations = (value: unknown): readonly PlayerObservation[] => {
  if (!Array.isArray(value)) throw new TypeError("Player import must be an array.");
  const ids = new Set<string>();
  return value.map((record, index) => validateRecord(record, index, ids));
};

function validateRecord(value: unknown, index: number, ids: Set<string>): PlayerObservation {
  if (!isRecord(value)) throw new TypeError(`Player record ${String(index)} must be an object.`);
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.includes(key.toLowerCase())) throw new TypeError(`Player record ${String(index)} contains a forbidden personal-data field.`);
    if (!ALLOWED_KEYS.has(key)) throw new TypeError(`Player record ${String(index)} contains an unknown field.`);
  }
  const participantId = stringField(value, "participantId", index);
  if (!/^p-[a-z0-9-]+$/i.test(participantId) || ids.has(participantId)) throw new TypeError(`Player record ${String(index)} has an invalid or duplicate anonymous id.`);
  ids.add(participantId);
  if (value["source"] !== "real-player") throw new TypeError(`Player record ${String(index)} must be labelled real-player.`);
  return {
    participantId,
    source: "real-player",
    taskVersion: stringField(value, "taskVersion", index),
    completedBoards: boundedInteger(value, "completedBoards", 0, 3, index),
    crownTriggered: booleanField(value, "crownTriggered", index),
    roundsPlayed: boundedInteger(value, "roundsPlayed", 1, 24, index),
    minutesPlayed: boundedNumber(value, "minutesPlayed", 0, 180, index),
    ...(typeof value["notes"] === "string" ? { notes: value["notes"] } : {}),
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function stringField(value: Readonly<Record<string, unknown>>, key: string, index: number): string { const field = value[key]; if (typeof field !== "string" || field.trim() === "") throw new TypeError(`Player record ${String(index)} needs ${key}.`); return field; }
function booleanField(value: Readonly<Record<string, unknown>>, key: string, index: number): boolean { const field = value[key]; if (typeof field !== "boolean") throw new TypeError(`Player record ${String(index)} needs ${key}.`); return field; }
function boundedInteger(value: Readonly<Record<string, unknown>>, key: string, min: number, max: number, index: number): number { const field = value[key]; if (!Number.isInteger(field) || typeof field !== "number" || field < min || field > max) throw new TypeError(`Player record ${String(index)} has invalid ${key}.`); return field; }
function boundedNumber(value: Readonly<Record<string, unknown>>, key: string, min: number, max: number, index: number): number { const field = value[key]; if (typeof field !== "number" || !Number.isFinite(field) || field < min || field > max) throw new TypeError(`Player record ${String(index)} has invalid ${key}.`); return field; }
