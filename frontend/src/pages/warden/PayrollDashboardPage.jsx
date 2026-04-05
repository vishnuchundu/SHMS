import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { FileDigit, AlertCircle, FileText, DownloadCloud, Play } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const slipSchema = z.object({
  payrollId: z.string().min(5, "Payroll Sequence Identifier natively enforced.")
});

export const PayrollDashboardPage = () => {
   const [slipBase64, setSlipBase64] = useState(null);

   const { register, handleSubmit, formState: { errors } } = useForm({
       resolver: zodResolver(slipSchema)
   });

   const payrollMutation = useMutation({
       mutationFn: async () => {
           // Executing dynamic current physical month natively "YYYY-MM"
           const targetDate = new Date();
           const payload = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
           const response = await axiosInstance.post(`/api/hr/payroll/calculate/${payload}`);
           return response.data;
       }
   });

   const pullSlipMutation = useMutation({
       mutationFn: async (payload) => {
           const response = await axiosInstance.get(`/api/hr/payroll/slip/${payload.payrollId}`);
           return response.data;
       },
       onSuccess: (data) => {
           setSlipBase64(data.pdfBase64);
       }
   });

   return (
      <div className="max-w-6xl mx-auto animate-fade-in text-gray-800 p-4 md:p-8">

        <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[60px] mix-blend-plus-lighter pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
               <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                    <FileDigit className="text-accent" size={24} /> 
                 </div>
                 Regional Payroll Execution
               </h1>
               <p className="text-gray-300 mt-3 font-medium tracking-wide">Strict synchronization arrays tracking absolute automated execution.</p>
             </div>
             <div>
                <button 
                  onClick={() => payrollMutation.mutate()}
                  disabled={payrollMutation.isPending}
                  className="px-8 py-4 bg-accent hover:bg-orange-600 rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(240,123,63,0.3)] transition-all disabled:opacity-50 flex items-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
                  {payrollMutation.isPending ? <Loader /> : <Play size={18} fill="currentColor"/>}
                  {payrollMutation.isPending ? 'Synchronizing Engine...' : 'Execute Automated Payroll'}
                </button>
             </div>
          </div>
        </div>

        {payrollMutation.isError && (
            <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-4 animate-fade-in shadow-sm">
               <AlertCircle className="text-danger-500 mt-0.5 shrink-0" size={24} />
               <div>
                  <h3 className="text-danger-800 font-bold">Execution Trapped</h3>
                  <p className="text-danger-700 text-sm mt-1 font-medium">{payrollMutation.error?.response?.data?.message || 'Failed connecting backend sequence.'}</p>
               </div>
            </div>
        )}

        {payrollMutation.isSuccess && (
            <div className="mb-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm animate-fade-in">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">BATCH EXECUTION RESULTS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Total Processed</span>
                        <span className="text-2xl font-black text-primary">{payrollMutation.data.totalStaffCalculated} records</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Total Expenditure</span>
                        <span className="text-2xl font-black text-danger-500">₹{payrollMutation.data.totalPayoutDisbursed}</span>
                    </div>
                </div>

                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-t border-gray-100 pt-6">Generated Cryptographic Envelopes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payrollMutation.data.generatedPayrolls?.map((slip) => (
                        <div key={slip.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-primary font-mono text-sm">{slip.id}</h4>
                                <span className="text-[10px] font-black tracking-widest text-accent uppercase">Staff Block: {slip.staffId}</span>
                            </div>
                            <span className="font-black text-gray-700">₹{slip.netCalculatedSalary}</span>
                        </div>
                    ))}
                    {payrollMutation.data.generatedPayrolls?.length === 0 && <p className="text-gray-400 font-medium italic">No new envelopes sequenced; execution array natively empty.</p>}
                </div>
            </div>
        )}

        {/* Dynamic PDF Interface securely mapped */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={18} className="text-primary"/> Access Generated Salary Slips
                </h2>
                
                <form onSubmit={handleSubmit(pullSlipMutation.mutate)} className="flex items-start md:items-center gap-3">
                   <div>
                       <input 
                          {...register("payrollId")}
                          placeholder="Target PAYROLL-ID"
                          className={`w-64 px-4 py-2.5 bg-gray-50 border rounded-xl font-mono focus:bg-white outline-none focus:ring-2 ${errors.payrollId ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}
                       />
                       {errors.payrollId && <p className="text-xs text-danger-500 font-bold mt-1 absolute">{errors.payrollId.message}</p>}
                   </div>
                   
                   <button 
                      type="submit"
                      disabled={pullSlipMutation.isPending}
                      className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-[#1f2b3b] transition-all flex items-center gap-2 whitespace-nowrap"
                   >
                       {pullSlipMutation.isPending ? 'Decrypting...' : 'View PDF'} <DownloadCloud size={16}/>
                   </button>
                </form>

                {pullSlipMutation.isError && (
                   <span className="text-danger-600 font-bold text-sm bg-danger-50 px-3 py-1 rounded">Instance Not Found explicitly.</span>
                )}
            </div>

            <div className="p-6 bg-gray-50/50 min-h-[400px] flex items-center justify-center">
                {slipBase64 ? (
                    <div className="w-full h-[600px] border border-gray-200 shadow-xl rounded-xl overflow-hidden animate-fade-in bg-white">
                        <div className="bg-[#1f2b3b] text-gray-300 p-2 text-xs font-mono font-bold flex justify-between tracking-widest border-b border-[#3d5470]">
                            <span>SHMS_CORE_PAYSLIP_VIEWER</span>
                            <span>{pullSlipMutation.data?.payrollId}</span>
                        </div>
                        <iframe
                            src={`data:application/pdf;base64,${slipBase64}`}
                            className="w-full h-full border-none bg-gray-100"
                            title="Staff Payslip Context Rendered"
                        />
                    </div>
                ) : (
                    <div className="text-center text-gray-400 font-medium">
                        <FileText size={48} className="mx-auto mb-4 opacity-50"/>
                        <p>No valid Base64 payload decrypted into render logic natively.</p>
                        <p className="text-xs mt-1">Execute payroll constraints or search historical logs actively.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
   );
};
