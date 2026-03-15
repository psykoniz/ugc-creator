import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId, type JobStatus } from "@ugc/shared";

export async function insertJob(input: {
  experimentId: string;
  scriptId: string;
  provider: string;
}) {
  const db = getDb();
  const id = createId("job");
  const now = new Date().toISOString();

  const [job] = await db
    .insert(schema.jobs)
    .values({
      id,
      experimentId: input.experimentId,
      scriptId: input.scriptId,
      status: "pending",
      provider: input.provider,
      retryCount: 0,
      createdAt: now,
    })
    .returning();

  return job;
}

export async function insertJobsBatch(
  jobs: Array<{
    experimentId: string;
    scriptId: string;
    provider: string;
  }>
) {
  const db = getDb();
  const now = new Date().toISOString();

  const values = jobs.map((j) => ({
    id: createId("job"),
    experimentId: j.experimentId,
    scriptId: j.scriptId,
    status: "pending" as JobStatus,
    provider: j.provider,
    retryCount: 0,
    createdAt: now,
  }));

  return db.insert(schema.jobs).values(values).returning();
}

export async function getJobById(id: string) {
  const db = getDb();
  return db.query.jobs.findFirst({
    where: eq(schema.jobs.id, id),
  });
}

export async function getJobsByExperimentId(experimentId: string) {
  const db = getDb();
  return db.query.jobs.findMany({
    where: eq(schema.jobs.experimentId, experimentId),
  });
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  extra?: { error?: string; startedAt?: string; completedAt?: string }
) {
  const db = getDb();
  await db
    .update(schema.jobs)
    .set({
      status,
      ...extra,
    })
    .where(eq(schema.jobs.id, id));
}

export async function incrementRetryCount(id: string) {
  const db = getDb();
  const job = await getJobById(id);
  if (!job) throw new Error(`Job not found: ${id}`);

  await db
    .update(schema.jobs)
    .set({
      retryCount: job.retryCount + 1,
      status: "pending",
      error: null,
    })
    .where(eq(schema.jobs.id, id));
}
