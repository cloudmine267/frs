import { useEffect, useState } from 'react';
import { getAuditLogs, AuditLog } from '@/lib/audit/auditLogger';
import { localDB } from '@/lib/localStorage';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this audit log?')) return;
    const updated = logs.filter(log => log.id !== id);
    localStorage.setItem('fsrf_audit_logs', JSON.stringify(updated));
    setLogs(updated);
  };

  const filteredLogs = logs.filter(
    log =>
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.type.toLowerCase().includes(search.toLowerCase()) ||
      log.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
      </div>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Timestamp</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Meta</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td className="border px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="border px-2 py-1">{log.type}</td>
              <td className="border px-2 py-1">{log.userId}</td>
              <td className="border px-2 py-1">{log.description}</td>
              <td className="border px-2 py-1">{JSON.stringify(log.meta)}</td>
              <td className="border px-2 py-1">
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(log.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
