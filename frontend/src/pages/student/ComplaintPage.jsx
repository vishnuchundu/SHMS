import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { MessageSquareWarning, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

const complaintSchema = z.object({
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'CLEANING', 'INTERNET', 'ATTENDANT', 'OTHER'], {
    required_error: "Category is required.",
  }),
  title: z.string().min(5, "Title must be at least 5 characters.").max(100),
  description: z.string().min(10, "Description must be detailed (min 10 chars).").max(1000),
});

export const ComplaintPage = () => {
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: { category: 'PLUMBING' }
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      // Concatenate the Category string explicitly to match the Backend purely relying on abstracted Title structures.
      const formattedPayload = {
        title: `[${payload.category}] ${payload.title}`,
        description: payload.description
      };
      const response = await axiosInstance.post('/api/complaints/lodge', formattedPayload);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    }
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in w-full">
      <div className="mb-8 p-6 bg-gradient-to-r from-primary to-gray-800 rounded-2xl shadow-md text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <MessageSquareWarning className="text-warning" size={32} /> Lodge a Complaint
        </h1>
        <p className="mt-2 text-gray-300 font-medium">
          Automatically routed to your Hall Warden. Please provide exact room numbers strictly if applicable.
        </p>
      </div>

      {success && (
        <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-4 shadow-sm animate-fade-in">
          <CheckCircle2 className="text-green-500 mt-0.5" size={24} />
          <div>
            <h3 className="text-green-800 font-bold">Complaint Formally Registered</h3>
            <p className="text-green-700 text-sm mt-1">Your warden has been notified concurrently via @Async logs.</p>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-danger-500 rounded-r-lg flex items-start gap-4 shadow-sm animate-fade-in">
          <AlertCircle className="text-danger-500 mt-0.5" size={24} />
          <div>
            <h3 className="text-danger-800 font-bold">Registration Failed</h3>
            <p className="text-danger-700 text-sm mt-1 font-medium">{mutation.error?.response?.data?.message || 'Unauthorized / Network failure.'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 relative overflow-hidden">
        
        {mutation.isPending && (
           <div className="absolute inset-0 bg-white/70 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
               <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-primary rounded-full mb-3" />
               <span className="text-primary font-bold tracking-wide">Dispatching Urgent Ticket...</span>
           </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 tracking-wide">COMPLAINT CATEGORY</label>
          <div className="relative">
            <Wrench className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <select 
              {...register("category")}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-gray-700 cursor-pointer"
            >
              <option value="PLUMBING">Plumbing & Water</option>
              <option value="ELECTRICAL">Electrical & Lighting</option>
              <option value="CLEANING">Cleaning & Sanitation</option>
              <option value="INTERNET">Network & Wi-Fi</option>
              <option value="ATTENDANT">Attendant Behavior</option>
              <option value="OTHER">Other Issues</option>
            </select>
          </div>
          {errors.category && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 tracking-wide">SHORT TITLE</label>
          <input 
            {...register("title")}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${errors.title ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'}`}
            placeholder="e.g. Broken washbasin tap in B-Wing"
          />
          {errors.title && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 tracking-wide">DETAILED DESCRIPTION</label>
          <textarea 
            {...register("description")}
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${errors.description ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} resize-none font-medium`}
            placeholder="Please detail the exact location and scope of the repair needed..."
          />
          {errors.description && <p className="text-xs text-danger-500 font-bold tracking-wide">{errors.description.message}</p>}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className={`w-full md:w-auto px-10 py-3.5 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center ${
              mutation.isPending ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg'
            }`}
          >
            Lodge Formal Complaint
          </button>
        </div>

      </form>
    </div>
  );
};
