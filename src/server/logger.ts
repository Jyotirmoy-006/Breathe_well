/**
 * @file logger.ts
 * @description Structured, typed application logger.
 * This is the ONLY file permitted to use console.* directly.
 * In production: JSON format. In development: human-readable format.
 */

/** Supported log levels in ascending severity order. */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Structured log entry shape for JSON output. */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatDev(level: LogLevel, message: string, data?: unknown): string {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  return data !== undefined
    ? `${prefix} ${message} ${JSON.stringify(data)}`
    : `${prefix} ${message}`;
}

function writeJson(entry: LogEntry): void {
  const line = JSON.stringify(entry);
  if (entry.level === 'error' || entry.level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

function writeDev(level: LogLevel, message: string, data?: unknown): void {
  const formatted = formatDev(level, message, data);
  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

function write(level: LogLevel, message: string, data?: unknown): void {
  if (isProduction) {
    writeJson({ level, message, timestamp: new Date().toISOString(), data });
  } else {
    writeDev(level, message, data);
  }
}

/** Application-wide structured logger. */
export const logger = {
  /** Log a debug-level message (verbose, dev-only relevant). */
  debug(message: string, data?: unknown): void {
    write('debug', message, data);
  },
  /** Log an informational message. */
  info(message: string, data?: unknown): void {
    write('info', message, data);
  },
  /** Log a warning. */
  warn(message: string, data?: unknown): void {
    write('warn', message, data);
  },
  /** Log an error. */
  error(message: string, data?: unknown): void {
    write('error', message, data);
  },
} as const;
