import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { CheckCircle2, AlertCircle, CreditCard, User, Hash, IndianRupee } from 'lucide-react';

const paymentSchema = z.object({
  studentId: z.string().min(3, "Student ID/Username is required"),
  amountPaid: z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be greater than zero"),
  paymentMode: z.enum(['CASH', 'CHEQUE', 'ONLINE'], { required_error: "Payment mode is required" }),
  referenceNumber: z.string().optional(),
});

export const RecordPaymentPage = () => {
  const [successData, setSuccessData] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMode: 'CASH', amountPaid: "" }
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/api/payments/record', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessData(data);
      reset(); // clear form
      setTimeout(() => setSuccessData(null), 5000);
    }
  });

  const onSubmit = (data) => {
    mutation.mutate({
      studentId: data.studentId,
      amountPaid: parseFloat(data.amountPaid),
      paymentMode: data.paymentMode,
      referenceNumber: data.referenceNumber || "CASH-TRX"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 animate-fade-in">
      <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-[50px] mix-blend-plus-lighter pointer-events-none" />
        <div className="relative z-10">
           <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
             <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <CreditCard className="text-accent" size={24} /> 
             </div>
             Record Student Payment
           </h1>
           <p className="text-gray-300 mt-3 font-medium tracking-wide">Log inbound transactions securely mapping natively into the financial ledger structures.</p>
        </div>
      </div>

      {successData && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-4 animate-fade-in shadow-sm">
          <CheckCircle2 className="text-green-500 mt-0.5" size={24} />
          <div>
            <h3 className="text-green-800 font-bold">Transaction Successfully Recorded</h3>
            <p className="text-green-700 text-sm mt-1">Transaction ID: <span className="font-mono bg-green-100 px-1 rounded">{successData.transactionId}</span></p>
            <p className="text-green-700 text-sm">Amount cleared: ₹{successData.amount} via {successData.method}</p>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4 animate-fade-in shadow-sm">
          <AlertCircle className="text-danger-500 mt-0.5" size={24} />
          <div>
            <h3 className="text-danger-800 font-bold">Transaction Request Failed</h3>
            <p className="text-danger-700 text-sm mt-1 font-medium">{mutation.error?.response?.data?.message || 'A network constraint was violated executing API call.'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 space-y-6 relative overflow-hidden">
        
        {/* Loading overlay intercept */}
        {mutation.isPending && (
           <div className="absolute inset-0 bg-white/70 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
               <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-accent rounded-full mb-3" />
               <span className="text-primary font-bold tracking-wide">Securing Transaction...</span>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 tracking-wide">STUDENT ID / USERNAME</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                {...register("studentId")}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${errors.studentId ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'}`}
                placeholder="e.g. student_test"
              />
            </div>
            {errors.studentId && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.studentId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 tracking-wide">AMOUNT PAID (INR)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="number"
                step="0.01"
                {...register("amountPaid", { valueAsNumber: true })}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${errors.amountPaid ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'}`}
                placeholder="0.00"
              />
            </div>
            {errors.amountPaid && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.amountPaid.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 tracking-wide">PAYMENT MODE</label>
            <select 
              {...register("paymentMode")}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-gray-700"
            >
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Bank Transfer / UPI</option>
            </select>
            {errors.paymentMode && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.paymentMode.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 tracking-wide">REFERENCE NO.</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                {...register("referenceNumber")}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Optional for Cash transactions"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
              mutation.isPending ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-[#1f2b3b]'
            }`}
          >
            {/* Highlight Sweep */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
            {mutation.isPending ? 'Executing Secure Bindings...' : 'Commit Record to Ledger'}
          </button>
        </div>
      </form>
    </div>
  );
};
