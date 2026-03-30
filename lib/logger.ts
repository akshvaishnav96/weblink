/**
 * Server-side daily file logger.
 *
 * Controlled by two env vars:
 *   APP_ENV=development|staging|production   — which environment is running
 *   ENABLE_LOGS=1                            — set to "1" to write log files
 *
 * Always outputs to console. When ENABLE_LOGS=1, also writes to logs/YYYY-MM-DD.log
 *
 * Usage (server components & API routes only — never import in client code):
 *   import { logger } from "@/lib/logger";
 *   logger.info("payment-intent", "Payment created", { amount: 100 });
 *   logger.warn("booking-create", "Staff ID missing");
 *   logger.error("booking-create", "Backend unreachable", err);
 */

import fs   from "fs";
import path from "path";

type Level = "INFO" | "WARN" | "ERROR";

// Check at call time (not module load) so env vars are always fresh
function isFileLoggingEnabled(): boolean {
  return process.env.ENABLE_LOGS === "1";
}

function getLogFilePath(): string {
  const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  return path.join(process.cwd(), "logs", `${date}.log`);
}

function serializeData(data: unknown): unknown {
  if (data instanceof Error) {
    return { name: data.name, message: data.message, stack: data.stack };
  }
  return data;
}

function buildLine(level: Level, context: string, message: string, data?: unknown): string {
  return JSON.stringify({
    ts:      new Date().toISOString(),
    env:     process.env.APP_ENV ?? "development",
    level,
    context,
    message,
    ...(data !== undefined && { data: serializeData(data) }),
  });
}

function writeToFile(line: string): void {
  try {
    const filePath = getLogFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(filePath, line + "\n", "utf8");
  } catch (err) {
    console.error("[logger] ⚠ Could not write to log file. Error:", err);
    console.error("[logger] ⚠ Attempted path:", getLogFilePath());
    console.error("[logger] ⚠ cwd:", process.cwd());
  }
}

function log(level: Level, context: string, message: string, data?: unknown): void {
  if (isFileLoggingEnabled()) {
    // Write to file only — no console clutter in staging/production
    writeToFile(buildLine(level, context, message, data));
  } else {
    // No file logging — use console (development)
    const fn = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;
    fn(`[${level}] [${context}] ${message}`, data ?? "");
  }
}

export const logger = {
  info:  (context: string, message: string, data?: unknown) => log("INFO",  context, message, data),
  warn:  (context: string, message: string, data?: unknown) => log("WARN",  context, message, data),
  error: (context: string, message: string, data?: unknown) => log("ERROR", context, message, data),
};
