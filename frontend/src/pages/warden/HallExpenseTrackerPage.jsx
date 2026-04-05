import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { BadgeDollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const expenseSchema = z.object({
  grantId: z.string().min(3, "Grant Identifier is mathematically required."),
  title: z.string().min(5, "Meaningful descriptor bound natively."),
  description: z.string().optional(),
  requestedAmount: z.number({ invalid_type_error: "Must map numerical limits explicitly." }).positive("Deduction requires positive bounding variables.")
});

export const HallExpenseTrackerPage = () => {
    const queryClient = useQueryClient();
    const [successMsg, setSuccessMsg] = useState(null);
    const [activeAuditGrant, setActiveAuditGrant] = useState(null); // Tracking Ledger Viewer State
    const [jurisdiction, setJurisdiction] = useState('HALL-A'); // Dynamic Regional Mapping

    const { data: regionalGrants, isLoading } = useQuery({
        queryKey: ['regional-grants', jurisdiction],
        queryFn: async () => {
            const response = await axiosInstance.get(`/api/grants/hall/${jurisdiction}`);
            return response.data;
        }
    });

    // Dynamic Audit Hook resolving Ledger Traces seamlessly
    const { data: auditLedger, isFetching: isAuditFetching, isError: isAuditError } = useQuery({
        queryKey: ['audit-ledger', activeAuditGrant],
        queryFn: async () => {
            if (!activeAuditGrant) return null;
            const response = await axiosInstance.get(`/api/grants/${activeAuditGrant}/ledger`);
            return response.data;
        },
        enabled: !!activeAuditGrant
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(expenseSchema)
    });

    const expenseMutation = useMutation({
        mutationFn: async (payload) => {
            const mappedPayload = { ...payload, requestedHallId: jurisdiction };
            const response = await axiosInstance.post('/api/grants/expenses/log', mappedPayload);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['regional-grants', jurisdiction]);
            if (activeAuditGrant) queryClient.invalidateQueries(['audit-ledger', activeAuditGrant]);
            setSuccessMsg(`Persisted localized deduction: ₹${data.deductedAmount}`);
            reset();
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    });

    if (isLoading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in text-gray-800 p-4 md:p-8">

            <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[60px] mix-blend-plus-lighter pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                   <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                     <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                        <BadgeDollarSign className="text-accent" size={24} /> 
                     </div>
                     Regional Expense Log
                   </h1>
                   <p className="text-gray-300 mt-3 font-medium tracking-wide">Deduct operational bounds safely checking backend mathematics intrinsically.</p>
                 </div>
                 <div className="bg-white/10 p-4 border border-white/20 rounded-xl backdrop-blur-md">
                     <label className="text-xs uppercase font-black text-white/70 tracking-widest block mb-2">ACTIVE JURISDICTION PROXY</label>
                     <select 
                         value={jurisdiction} 
                         onChange={(e) => setJurisdiction(e.target.value)}
                         className="px-4 py-2 w-48 bg-white/90 text-primary font-bold rounded-lg outline-none cursor-pointer"
                     >
                         <option value="HALL-A">Newton Hall (A Wing)</option>
                         <option value="HALL-B">Einstein Hall (B Wing)</option>
                         <option value="HALL-C">Curie Hall (C Wing)</option>
                     </select>
                 </div>
              </div>
            </div>

            {expenseMutation.isError && (
                <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-4 animate-fade-in shadow-sm">
                   <AlertCircle className="text-danger-500 mt-0.5 shrink-0" size={24} />
                   <div>
                      <h3 className="text-danger-800 font-bold">Execution Trapped Structurally</h3>
                      <p className="text-danger-700 text-sm mt-1 font-medium italic">{expenseMutation.error?.response?.data?.message || 'Ledger violation explicitly mapped.'}</p>
                   </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Log Deductions Form Limits */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:p-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Append Regional Expenditure</h2>
                    
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold flex items-center gap-2">
                            <CheckCircle size={20}/> <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Pre-flight Mathematical Visual Warning */}
                    <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-2 mb-1"><AlertCircle size={14} className="text-warning"/> Mathematical Guard Enabled:</span>
                        The execution will absolutely revert if <span className="text-danger-500">requestedAmount {'>'} currentBalance</span> implicitly tracking explicit endpoints natively.
                    </div>

                    <form onSubmit={handleSubmit(expenseMutation.mutate)} className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">TARGET LEDGER TRACE (GRANT ID)</label>
                            <select {...register("grantId")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all">
                                <option value="">-- Choose Assigned Reserve --</option>
                                {regionalGrants?.map(g => (
                                   <option key={g.id} value={g.id}>{g.grantName} - (Remaining: ₹{g.remainingBalance})</option>
                                ))}
                            </select>
                            {errors.grantId && <p className="text-xs text-danger-500 font-bold mt-1">{errors.grantId.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">DEDUCTION TITLING</label>
                            <input {...register("title")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all" placeholder="e.g. Electrical Main Replacements" />
                            {errors.title && <p className="text-xs text-danger-500 font-bold mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">DEDUCTION BOUNDARY (INR)</label>
                            <input type="number" step="0.01" {...register("requestedAmount", { valueAsNumber: true })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all font-black text-danger-500" placeholder="e.g. 5000.00" />
                            {errors.requestedAmount && <p className="text-xs text-danger-500 font-bold mt-1">{errors.requestedAmount.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={expenseMutation.isPending}
                            className={`w-full py-4 mt-4 rounded-xl font-black text-white shadow-xl transition-all ${
                                expenseMutation.isPending ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:-translate-y-0.5 hover:shadow-primary/30'
                            }`}
                        >
                            {expenseMutation.isPending ? 'Validating Limitations...' : 'Lock Structural Deduction Database'}
                        </button>
                    </form>
                </div>

                {/* 2. Audit Viewer */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-stretch overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 w-full shrink-0">
                       <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <FileText size={18} className="text-primary"/> Statement Auditing Protocol
                       </h2>
                       <select 
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-accent outline-none transition-all"
                          value={activeAuditGrant || ""}
                          onChange={(e) => setActiveAuditGrant(e.target.value)}
                       >
                           <option value="">-- Select Master Ledger Proxy --</option>
                           {regionalGrants?.map(g => (
                              <option key={g.id} value={g.id}>{g.grantName}</option>
                           ))}
                       </select>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto bg-white min-h-[400px]">
                        {!activeAuditGrant && (
                           <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                               <FileText size={48} className="mb-4 opacity-50"/>
                               <p className="font-bold">Select a valid root trace object.</p>
                           </div>
                        )}
                        
                        {isAuditFetching && activeAuditGrant && <Loader />}
                        {isAuditError && activeAuditGrant && <p className="text-danger-500 font-bold">Failed synchronization pull natively.</p>}
                        
                        {auditLedger && !isAuditFetching && (
                           <div className="animate-fade-in space-y-6">
                               <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative overflow-hidden">
                                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-accent to-primary left-0"></div>
                                  <h3 className="font-black text-lg text-primary">{auditLedger.parentGrant.grantName}</h3>
                                  <div className="flex justify-between items-end mt-2">
                                     <div>
                                        <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">INITIAL SEED</p>
                                        <p className="text-sm font-mono text-gray-600 font-bold">{auditLedger.parentGrant.allocatedAmount}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">ACTIVE SURPLUS BOUNDARY</p>
                                        <p className="text-xl font-black text-green-600">₹{auditLedger.parentGrant.remainingBalance}</p>
                                     </div>
                                  </div>
                               </div>

                               <div>
                                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Historical Traces ({auditLedger.associatedExpenses.length})</h4>
                                  <div className="space-y-3">
                                      {auditLedger.associatedExpenses.length === 0 && <p className="text-gray-400 italic text-sm font-medium">No recorded temporal offsets mapped mathematically yet.</p>}
                                      {auditLedger.associatedExpenses.map(exp => (
                                          <div key={exp.id} className="p-3 bg-white border border-gray-100 shadow-sm rounded-lg flex justify-between items-start group hover:border-danger-200 transition-colors">
                                              <div>
                                                 <p className="font-bold text-sm text-gray-700">{exp.title}</p>
                                                 <p className="text-xs font-mono text-gray-400 mt-1">{new Date(exp.timestamp).toLocaleString()}</p>
                                              </div>
                                              <span className="font-black text-danger-500 whitespace-nowrap">- ₹{exp.deductedAmount}</span>
                                          </div>
                                      ))}
                                  </div>
                               </div>
                           </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
