import { saveAuditLog, getAuditLogs as getAuditLogsFromStorage } from '../localStorage';

// Audit Logger Utility
// Logs activities: login, registration, file upload, edit, deletion, etc.

export type AuditLogType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'FILE_UPLOAD'
  | 'EDIT'
  | 'DELETE';

export interface AuditLog {
  id: string;
  type: AuditLogType;
  userId: string;
  description: string;
  timestamp: number;
  meta?: Record<string, any>;
}

export function logActivity(
  type: AuditLogType,
  userId: string,
  description: string,
  meta?: Record<string, any>
) {
  const log: AuditLog = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    userId,
    description,
    timestamp: Date.now(),
    meta,
  };
  saveAuditLog(log);
}

export function getAuditLogs(): AuditLog[] {
  return getAuditLogsFromStorage();
}
