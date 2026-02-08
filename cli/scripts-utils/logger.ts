/**
 * Centralized logger for CLI scripts.
 * Provides consistent logging format and levels.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'progress';

class Logger {
  private prefix: string;

  constructor(prefix?: string) {
    this.prefix = prefix ? `[${prefix}]` : '';
  }

  private formatMessage(level: LogLevel, message: string): string {
    const prefix = this.prefix ? `${this.prefix} ` : '';
    return `${prefix}[${level}] ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  error(message: string): void {
    console.error(this.formatMessage('error', message));
  }

  success(message: string): void {
    console.log(this.formatMessage('success', message));
  }

  progress(message: string): void {
    console.log(this.formatMessage('progress', message));
  }

  /**
   * Log a step.
   */
  step(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  /**
   * Log progress for a long-running operation.
   * Only logs at intervals to avoid spam.
   */
  progressStep(current: number, total: number, itemName?: string): void {
    const logInterval = Math.max(1, Math.floor(total / 10)); // Log every 10%
    if (current % logInterval === 0 || current === 1 || current === total) {
      const item = itemName ? `: ${itemName}` : '';
      this.progress(`(${current}/${total})${item}`);
    }
  }

  /**
   * Create a sub-logger with a prefix.
   */
  child(prefix: string): Logger {
    const parentPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger(parentPrefix);
  }
}

/**
 * Default logger instance.
 */
export const logger = new Logger();

/**
 * Create a logger with a specific prefix.
 */
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}
