import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { CheckCircle2, AlertCircle, Utensils, IndianRupee, Layers } from 'lucide-react';

const messSchema = z.object({
  hallId: z.string().min(1, "Hall ID is strictly required to bind payload logic."),
  chargePerStudent: z.number({ invalid_type_error: "Charge must be numeric." }).positive("Base charge must exceed zero."),
});

export const MessManagerPage = () => {
  const [batchResult, setBatchResult] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(messSchema),
    defaultValues: { hallId: 'HALL-A', chargePerStudent: 3500 } // Typical local defaults mapped 
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/api/billing/mess-charges/batch', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setBatchResult(data);
      reset();
      setTimeout(() => setBatchResult(null), 8000);
    }
  });

  const onSubmit = (data) => {
     mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in text-gray-800 p-4 md:p-8">
      
      {/* Dynamic Native Theme Mappings */}
      <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[60px] mix-blend-plus-lighter pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <Utensils className="text-accent" size={24} /> 
               </div>
               Bulk Mess Billing Control
             </h1>
             <p className="text-gray-300 mt-3 font-medium tracking-wide">Secure execution environment broadcasting flat mess dues strictly across entire Hall populations.</p>
           </div>
        </div>
      </div>

      {batchResult && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4 animate-fade-in shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
          <CheckCircle2 className="text-green-500 mt-1 shrink-0 bg-white rounded-full p-0.5 shadow-sm" size={28} />
          <div className="relative z-10">
            <h3 className="text-green-800 font-black text-lg tracking-tight">Batch Sequence Validated</h3>
            <p className="text-green-700 mt-2 font-medium">
                Successfully propagated <span className="font-bold underline">₹{batchResult.chargePerStudent}</span> securely directly updating native balances natively.
            </p>
            <div className="mt-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-green-100 w-max shadow-sm">
                <Layers size={16} className="text-green-600"/>
                <span className="text-sm font-black text-green-800">Affected Students: {batchResult.studentsBilled}</span>
            </div>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-4 animate-fade-in shadow-sm">
          <AlertCircle className="text-danger-500 mt-0.5 shrink-0" size={24} />
          <div>
            <h3 className="text-danger-800 font-bold">Execution Blocked</h3>
            <p className="text-danger-700 text-sm mt-1 font-medium">{mutation.error?.response?.data?.message || 'Server refused payload execution explicitly mapped.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-4">
           <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl h-full shadow-inner relative overflow-hidden">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">EXECUTION WARNING</h3>
              <p className="text-sm font-medium text-gray-600 leading-relaxed relative z-10">
                 Triggering this action maps immediate persistent <span className="text-danger-500 font-bold">addition</span> modifications to the targeted bounds exactly.
              </p>
              <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-xl relative z-10">
                 <p className="text-xs font-bold text-gray-700 flex items-start gap-2">
                    <span className="p-0.5 bg-warning rounded-full"><AlertCircle size={10} className="text-white"/></span>
                    Values cannot be reversed via UI implicitly!
                 </p>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                 <Utensils size={150} />
              </div>
           </div>
        </div>

        <div className="md:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl p-8 relative overflow-hidden h-full">
            
            {mutation.isPending && (
              <div className="absolute inset-0 bg-white/70 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                 <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-accent rounded-full mb-3" />
                 <span className="text-primary font-black tracking-widest uppercase text-xs">Propagating Database Modifications...</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">JURISDICTION / PROXY ID</label>
                <input 
                  {...register("hallId")}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 font-bold ${errors.hallId ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'}`}
                  placeholder="e.g. HALL-A"
                />
                {errors.hallId && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.hallId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">PER CAPITA MESS DUES (INR)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="number"
                    step="0.01"
                    {...register("chargePerStudent", { valueAsNumber: true })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 font-black text-primary ${errors.chargePerStudent ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'}`}
                    placeholder="e.g. 3500.00"
                  />
                </div>
                {errors.chargePerStudent && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.chargePerStudent.message}</p>}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-black tracking-wide text-white shadow-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                  mutation.isPending ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-[#1f2b3b]'
                }`}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
                {mutation.isPending ? 'Executing Action' : 'Apply Mass Ledger Charge'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
