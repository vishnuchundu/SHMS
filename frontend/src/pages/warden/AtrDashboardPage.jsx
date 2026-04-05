import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { CheckSquare, AlertCircle, CalendarClock, Ban, ShieldCheck, X } from 'lucide-react';

export const AtrDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeModalTicket, setActiveModalTicket] = useState(null);
  const [atrInput, setAtrInput] = useState('');

  // 1. Fetching logic simulating local hardcoded 'HALL-A' jurisdiction as planned.
  const { data: complaints, isLoading, isError } = useQuery({
    queryKey: ['wardenComplaints', 'HALL-A'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/complaints/hall/HALL-A?status=OPEN');
      return response.data;
    },
    // We poll frequently for the dashboard
    refetchInterval: 30000, 
  });

  // 2. Strict Zod-free manual string validation mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ complaintId, payload }) => {
      const response = await axiosInstance.put(`/api/complaints/${complaintId}/status`, payload);
      return response.data;
    },
    onSuccess: () => {
      // THE FIX: Natively sweep the entire Cache locally forcing an instantaneous re-render!
      queryClient.invalidateQueries({ queryKey: ['wardenComplaints'] });
      setActiveModalTicket(null);
      setAtrInput('');
    }
  });

  const handleResolutionSubmit = (e) => {
    e.preventDefault();
    if (!atrInput || atrInput.trim().length < 5) return;
    
    resolveMutation.mutate({
      complaintId: activeModalTicket.id,
      payload: {
        status: 'CLOSED',
        atrDetails: atrInput.trim()
      }
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      
      {/* 1. Header Context */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-primary">
            <CheckSquare className="text-accent" size={32} /> ATR Action Dashboard
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            Jurisdiction: <span className="font-bold text-gray-700">HALL-A</span> | Open Tickets: {complaints?.length || 0}
          </p>
        </div>
        <div className="bg-orange-50 text-accent px-4 py-2 rounded-lg font-bold border border-orange-100 flex items-center gap-2 shadow-sm">
           <AlertCircle size={20} /> Live Polling Active
        </div>
      </div>

      {/* 2. Error Check */}
      {isError && (
        <div className="p-8 text-center text-danger-500 font-bold bg-danger-50 border border-danger-100 rounded-xl mb-8">
          Failed to fetch tickets from /api/complaints/hall/HALL-A. Ensure Server is live.
        </div>
      )}

      {/* 3. Ticket Grid view */}
      {complaints && complaints.length === 0 ? (
        <div className="bg-gray-50 p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
            <ShieldCheck size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-400">Zero Open Complaints</h2>
            <p className="text-gray-400 font-medium mt-1">All student grievances in your jurisdiction have been successfully resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {complaints?.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden flex flex-col md:flex-row items-stretch">
               
               <div className="bg-gray-50 w-full md:w-48 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
                  <span className="text-xs font-black text-gray-400 tracking-widest uppercase mb-1">TICKET ID</span>
                  <span className="font-mono text-primary font-bold">{ticket.id.substring(0,8).toUpperCase()}</span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
                     <CalendarClock size={14} />
                     {new Date(ticket.timestamp).toLocaleDateString()}
                  </div>
               </div>

               <div className="flex-1 p-6 relative">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-bold text-gray-800">{ticket.title}</h3>
                        <p className="text-gray-600 font-medium mt-3 text-sm leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                          {ticket.description}
                        </p>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-end shrink-0">
                     <button 
                        onClick={() => setActiveModalTicket(ticket)}
                        className="bg-primary hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all text-sm flex items-center gap-2 hover:-translate-y-0.5"
                     >
                        <CheckSquare size={16} /> Resolve Issue
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Explicit Resolution Modal / Popup executing ATR */}
      {activeModalTicket && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                 <h2 className="font-bold text-lg text-primary flex items-center gap-2">
                    <CheckSquare size={20} className="text-accent"/> Submit Action Taken Report (ATR)
                 </h2>
                 <button 
                    onClick={() => { setActiveModalTicket(null); setAtrInput(''); }}
                    className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-md transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleResolutionSubmit} className="p-6">
                 
                 <div className="mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                    <p className="text-xs font-bold text-blue-400 tracking-wider">RESOLVING TICKET</p>
                    <p className="font-medium text-primary mt-1">{activeModalTicket.title}</p>
                 </div>

                 <div className="space-y-2 mb-8">
                    <label className="text-sm font-bold text-gray-700 tracking-wide">ACTION TAKEN REPORT / RESOLUTION MEMO</label>
                    <textarea 
                      required
                      value={atrInput}
                      onChange={(e) => setAtrInput(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-medium"
                      placeholder="Explicitly document the logistical resolution taken. (e.g. Plumber dispatched on DD/MM. Pipe replaced.)"
                    />
                    {atrInput.length > 0 && atrInput.trim().length < 5 && (
                       <p className="text-xs text-danger-500 font-bold flex items-center gap-1 mt-1">
                         <Ban size={12}/> ATR string must contain valid technical context.
                       </p>
                    )}
                 </div>

                 {resolveMutation.isError && (
                    <div className="mb-6 p-4 bg-danger-50 border border-danger-100 text-danger-600 rounded-lg text-sm font-bold">
                       {resolveMutation.error?.response?.data?.message || 'Server rejected ATR update bounds. Ensure roles are strictly configured.'}
                    </div>
                 )}

                 <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                     <button 
                        type="button"
                        onClick={() => { setActiveModalTicket(null); setAtrInput(''); }}
                        className="px-6 py-2.5 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        disabled={resolveMutation.isPending}
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        disabled={resolveMutation.isPending || atrInput.trim().length < 5}
                        className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-sm transition-all flex items-center gap-2 ${
                          (resolveMutation.isPending || atrInput.trim().length < 5) ? 'bg-primary/50 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 hover:-translate-y-0.5'
                        }`}
                     >
                        {resolveMutation.isPending ? 'Closing Logic...' : 'Close Complaint'}
                     </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};
