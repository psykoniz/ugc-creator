import { type Page } from "@playwright/test";

/**
 * The API base URL used for direct API calls in tests.
 * The Web frontend proxies /api/* to this URL.
 */
export const API_URL = process.env.API_URL || "http://localhost:3001";

/**
 * Direct API helper for setup/teardown outside the browser.
 */
export async function apiPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`API ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`API GET ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Wait for API health check to be ready.
 */
export async function waitForApi(maxWaitMs = 30_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`API not ready after ${maxWaitMs}ms`);
}
