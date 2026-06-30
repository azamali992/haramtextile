/**
 * Minimal structured JSON logger. Every log line includes a request ID so
 * individual requests can be traced through logs even under concurrent
 * load.
 */
import { randomUUID } from "crypto";

export function newRequestId(): string {
  return randomUUID();
}

type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, requestId: string, event: string, extra?: Record<string, unknown>) {
  const entry = {
    level,
    requestId,
    event,
    timestamp: new Date().toISOString(),
    ...extra,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (requestId: string, event: string, extra?: Record<string, unknown>) =>
    log("info", requestId, event, extra),
  warn: (requestId: string, event: string, extra?: Record<string, unknown>) =>
    log("warn", requestId, event, extra),
  error: (requestId: string, event: string, extra?: Record<string, unknown>) =>
    log("error", requestId, event, extra),
};
