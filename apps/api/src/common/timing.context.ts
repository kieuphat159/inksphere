import { AsyncLocalStorage } from 'async_hooks';

export interface DbQueryTiming {
  model: string;
  action: string;
  durationMs: number;
  args?: unknown;
}

export interface RequestTiming {
  requestId: string;
  method: string;
  url: string;
  startTime: bigint;
  startTimeMs: number;
  dbQueries: DbQueryTiming[];
  totalDbTimeMs: number;
  checkpoints: Map<string, number>;
}

const timingStore = new AsyncLocalStorage<RequestTiming>();

function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function startTiming(method: string, url: string): RequestTiming {
  const timing: RequestTiming = {
    requestId: generateRequestId(),
    method,
    url,
    startTime: process.hrtime.bigint(),
    startTimeMs: Date.now(),
    dbQueries: [],
    totalDbTimeMs: 0,
    checkpoints: new Map(),
  };
  return timing;
}

export function runWithTiming<T>(timing: RequestTiming, fn: () => T): T {
  return timingStore.run(timing, fn);
}

export function logDbQuery(
  model: string,
  action: string,
  durationMs: number,
  args?: unknown,
): void {
  const timing = getCurrentTiming();
  if (!timing) return;
  timing.dbQueries.push({ model, action, durationMs, args });
  timing.totalDbTimeMs += durationMs;
}

export function logCheckpoint(name: string): void {
  const timing = getCurrentTiming();
  if (!timing) return;
  const elapsed = Number(process.hrtime.bigint() - timing.startTime) / 1e6;
  timing.checkpoints.set(name, elapsed);
}

export function getCurrentTiming(): RequestTiming | undefined {
  return timingStore.getStore();
}

export function getElapsedMs(timing: RequestTiming): number {
  return Number(process.hrtime.bigint() - timing.startTime) / 1e6;
}

export function formatTimingReport(timing: RequestTiming): string {
  const totalMs = getElapsedMs(timing);
  const lines: string[] = [
    `┌──────────────────────────────────────────────────────────────────────`,
    `│ [Timing] ${timing.method} ${timing.url} | total: ${totalMs.toFixed(2)}ms | db: ${timing.totalDbTimeMs.toFixed(2)}ms | queries: ${timing.dbQueries.length}`,
    `├──────────────────────────────────────────────────────────────────────`,
  ];

  if (timing.totalDbTimeMs > 0) {
    lines.push(`│ [DB Queries]:`);
    for (const q of timing.dbQueries) {
      lines.push(`│   - ${q.model}.${q.action} | ${q.durationMs.toFixed(2)}ms`);
    }
    lines.push(
      `├──────────────────────────────────────────────────────────────────────`,
    );
  }

  if (timing.checkpoints.size > 0) {
    lines.push(`│ [Checkpoints]:`);
    for (const [name, elapsed] of timing.checkpoints) {
      lines.push(`│   - ${name}: ${elapsed.toFixed(2)}ms`);
    }
    lines.push(
      `├──────────────────────────────────────────────────────────────────────`,
    );
  }

  // Bottleneck warning
  const dbRatio = timing.totalDbTimeMs / totalMs;
  if (dbRatio > 0.7) {
    lines.push(
      `│ ⚠️ BOTTLENECK: DB queries take ${(dbRatio * 100).toFixed(0)}% of total time`,
    );
  }
  if (totalMs > 5000) {
    lines.push(
      `│ ⚠️ SLOW REQUEST: ${totalMs.toFixed(0)}ms exceeds 5s threshold`,
    );
  }

  lines.push(
    `└──────────────────────────────────────────────────────────────────────`,
  );
  return lines.join('\n');
}
