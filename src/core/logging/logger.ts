export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = Readonly<Record<string, unknown>>;

export interface LogEntry {
  readonly level: LogLevel;
  readonly scope: string;
  readonly message: string;
  readonly context?: LogContext;
  readonly timestamp: string;
}

export interface LogSink {
  write(entry: LogEntry): void;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(scope: string): Logger;
}

export interface LoggerOptions {
  readonly enabled: boolean;
  readonly scope?: string;
  readonly minLevel?: LogLevel;
  readonly sink?: LogSink;
  readonly now?: () => Date;
}

const LEVEL_WEIGHT: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export const consoleSink: LogSink = {
  write({ level, scope, message, context, timestamp }) {
    const line = `${timestamp} ${level.toUpperCase().padEnd(5)} [${scope}] ${message}`;
    const args: unknown[] = context === undefined ? [line] : [line, context];
    /* eslint-disable no-console -- the console sink is the one place allowed to print */
    switch (level) {
      case 'debug':
        console.debug(...args);
        break;
      case 'info':
        console.info(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        break;
    }
    /* eslint-enable no-console */
  },
};

export function createLogger(options: LoggerOptions): Logger {
  const {
    enabled,
    scope = 'app',
    minLevel = 'debug',
    sink = consoleSink,
    now = () => new Date(),
  } = options;

  const log = (level: LogLevel, message: string, context?: LogContext): void => {
    if (!enabled || LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) {
      return;
    }
    sink.write({ level, scope, message, context, timestamp: now().toISOString() });
  };

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
    child: childScope => createLogger({ ...options, scope: `${scope}:${childScope}` }),
  };
}

export const silentLogger: Logger = createLogger({ enabled: false });
