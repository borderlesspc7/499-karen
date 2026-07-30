import * as functionsLogger from 'firebase-functions/logger'

type LogMeta = Record<string, unknown>

type AuditInput = {
  action: string
  userId?: string
  meta?: LogMeta
}

export function info(message: string, meta: LogMeta = {}): void {
  functionsLogger.info(message, meta)
}

export function warn(message: string, meta: LogMeta = {}): void {
  functionsLogger.warn(message, meta)
}

export function error(message: string, caughtError?: unknown, meta: LogMeta = {}): void {
  functionsLogger.error(message, {
    ...meta,
    error:
      caughtError instanceof Error
        ? { name: caughtError.name, message: caughtError.message, stack: caughtError.stack }
        : caughtError,
  })
}

export function audit({ action, userId, meta = {} }: AuditInput): void {
  functionsLogger.info('audit', {
    action,
    userId,
    ...meta,
  })
}
