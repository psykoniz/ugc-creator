import { nanoid } from "nanoid";

const PREFIXES = {
  product: "prod",
  creative_pack: "cpk",
  hook: "hook",
  script: "scr",
  experiment: "exp",
  job: "job",
  output: "out",
  rating: "rat",
} as const;

export type EntityType = keyof typeof PREFIXES;
export type PrefixedId = `${(typeof PREFIXES)[EntityType]}_${string}`;

export function createId(entity: EntityType): string {
  const prefix = PREFIXES[entity];
  return `${prefix}_${nanoid(21)}`;
}

export { PREFIXES };
