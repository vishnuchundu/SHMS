import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { Server, Terminal, CalendarClock, ShieldAlert, Fingerprint } from 'lucide-react';

export const AuditLogsPage = () => {
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['systemAuditLogs'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/audit/logs');
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-[#1f2b3b] rounded-2xl shadow-xl text-white border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight relative z-10">
          <Terminal className="text-accent" size={32} /> System Audit Execution Logs
        </h1>
        <p className="mt-2 text-gray-300 font-medium relative z-10 text-sm">
          Strictly monitoring cross-module dependencies, transactions, and explicit payload triggers explicitly bounded natively.
        </p>
      </div>

      {isError && (
        <div className="p-8 text-center text-danger-500 font-bold bg-danger-50 border border-danger-100 rounded-xl mb-8 flex flex-col items-center gap-2">
          <ShieldAlert size={32} />
          Failed to fetch strict logs securely. Validate Role Constraints cleanly.
        </div>
      )}

      {!isError && logs?.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center">
           <Server className="w-16 h-16 text-gray-300 mb-4" />
           <p className="text-xl font-bold text-gray-400">Structural Array Empty</p>
           <p className="text-sm font-medium text-gray-400 mt-1">No operations have been permanently executed locally.</p>
        </div>
      )}

      {logs && logs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse whitespace-nowrap hide-scroll">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-black tracking-widest uppercase">
                <th className="px-6 py-4">TIMESTAMP</th>
                <th className="px-6 py-4">ACTION VECTOR</th>
                <th className="px-6 py-4 border-l border-gray-100">TARGET REF</th>
                <th className="px-6 py-4 border-l border-gray-100">EXECUTOR (ID/IP)</th>
                <th className="px-6 py-4 border-l border-gray-100 w-full">PAYLOAD MEMO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-sm text-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-gray-500 font-bold">
                        <CalendarClock size={16} className="text-gray-400" />
                        {new Date(log.timestamp).toLocaleString()}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded shadow-inner text-xs font-black tracking-wide">
                        {log.method}
                     </span>
                  </td>
                  <td className="px-6 py-4 border-l border-gray-50 font-mono text-xs">
                     {log.entityId?.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 border-l border-gray-50 text-xs">
                     <div className="flex items-center gap-2 text-gray-500 font-mono">
                         <Fingerprint size={14} className="text-primary"/>
                         {log.userId?.substring(0, 8)}
                     </div>
                  </td>
                  <td className="px-6 py-4 border-l border-gray-50 whitespace-pre-wrap leading-relaxed text-gray-600">
                     {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
