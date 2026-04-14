import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { Landmark, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const grantSchema = z.object({
  hallId: z.string().min(1, "Target Proxy ID required natively."),
  grantName: z.string().min(5, "Title definition structurally enforced."),
  allocatedAmount: z.number({ invalid_type_error: "Must be numeric value." }).positive("Funds inherently bounded greater than 0."),
});

export const ChairmanDashboardPage = () => {
    const queryClient = useQueryClient();
    const [successMsg, setSuccessMsg] = useState(null);

    const { data: grants, isLoading, isError } = useQuery({
        queryKey: ['global-grants'],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/grants');
            return response.data;
        }
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(grantSchema)
    });

    const allocateMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post('/api/grants/allocate', payload);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['global-grants']);
            setSuccessMsg(`Distributed ₹${data.allocatedAmount} strictly mapped to ${data.hallId}.`);
            reset();
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    });

    // Compute Stat Cards dynamically resolving loaded Grant Arrays
    const stats = grants ? grants.reduce((acc, curr) => {
        acc.totalAllocated += curr.allocatedAmount;
        acc.totalRemaining += curr.remainingBalance;
        acc.totalSpent += (curr.allocatedAmount - curr.remainingBalance);
        return acc;
    }, { totalAllocated: 0, totalRemaining: 0, totalSpent: 0 }) : { totalAllocated: 0, totalRemaining: 0, totalSpent: 0 };

    if (isLoading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in text-gray-800 p-4 md:p-8">

            <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[60px] mix-blend-plus-lighter pointer-events-none" />
              <div className="relative z-10">
                 <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                   <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                      <Landmark className="text-accent" size={24} /> 
                   </div>
                   Chairman Financial Director
                 </h1>
                 <p className="text-gray-300 mt-3 font-medium tracking-wide">High-level Institute Grant Analytics traversing entire regional arrays.</p>
              </div>
            </div>

            {/* Global Stat Cards Engine explicitly bounded rendering native mathematical combinations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
                   <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0"><Landmark size={24}/></div>
                   <div>
                       <span className="text-xs font-black tracking-widest text-gray-400 uppercase">Globally Allocated</span>
                       <h2 className="text-2xl font-black text-gray-800 mt-1">₹{stats.totalAllocated.toLocaleString()}</h2>
                   </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
                   <div className="p-3 bg-danger-500/10 text-danger-600 rounded-xl shrink-0"><TrendingDown size={24}/></div>
                   <div>
                       <span className="text-xs font-black tracking-widest text-gray-400 uppercase">Expenditure Trapped</span>
                       <h2 className="text-2xl font-black text-danger-600 mt-1">₹{stats.totalSpent.toLocaleString()}</h2>
                   </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
                   <div className="p-3 bg-green-500/10 text-green-600 rounded-xl shrink-0"><TrendingUp size={24}/></div>
                   <div>
                       <span className="text-xs font-black tracking-widest text-gray-400 uppercase">Institute Wide Reserves</span>
                       <h2 className="text-2xl font-black text-green-600 mt-1">₹{stats.totalRemaining.toLocaleString()}</h2>
                   </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Global View lists */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:p-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Active Ledger Trees</h2>
                    
                    {isError && (
                        <div className="p-4 bg-danger/10 text-danger-600 rounded-xl font-bold flex items-center gap-2 mb-4">
                             <AlertCircle size={20}/>
                             <span>API Synchronization Blocked</span>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {grants?.map((grant) => (
                            <div key={grant.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col gap-3 group">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-primary group-hover:text-accent transition-colors">{grant.grantName}</h3>
                                    <span className="font-mono text-xs text-gray-600 font-bold bg-white px-2 py-1 border border-gray-200 rounded">{grant.hallId}</span>
                                </div>
                                
                                {/* Progress Bar Visualizing Spent Capacity */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                        <span>Spent: ₹{grant.allocatedAmount - grant.remainingBalance}</span>
                                        <span>Allocated: ₹{grant.allocatedAmount}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                                        <div 
                                          className={`h-2 rounded-full ${((grant.allocatedAmount - grant.remainingBalance) / grant.allocatedAmount) > 0.8 ? 'bg-danger-500' : 'bg-green-500'}`} 
                                          style={{ width: `${((grant.allocatedAmount - grant.remainingBalance) / grant.allocatedAmount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Execute Financial Distribution Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:p-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Distribute Native Sub-Grant</h2>
                    
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold flex items-center gap-2">
                            <CheckCircle size={20}/> <span>{successMsg}</span>
                        </div>
                    )}

                    {allocateMutation.isError && (
                        <div className="mb-6 p-4 bg-danger-50 text-danger-700 rounded-xl font-bold flex items-center gap-2 border border-danger-200">
                            <AlertCircle size={20}/>
                            <span>{allocateMutation.error?.response?.data?.message || allocateMutation.error?.message || "Server Error"}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(allocateMutation.mutate)} className="space-y-5">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">REGIONAL TARGET ID</label>
                            <input {...register("hallId")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all focus:border-accent" placeholder="e.g. HALL-A" />
                            {errors.hallId && <p className="text-xs text-danger-500 font-bold tracking-wide mt-1">{errors.hallId.message}</p>}
                        </div>
                        
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">LEDGER CONTEXT DEFINITION</label>
                            <input {...register("grantName")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all focus:border-accent" placeholder="e.g. Security Upgrades" />
                            {errors.grantName && <p className="text-xs text-danger-500 font-bold tracking-wide mt-1">{errors.grantName.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">MATHEMATICAL CEILING BOUNDARY (INR)</label>
                            <input type="number" step="0.01" {...register("allocatedAmount", { valueAsNumber: true })} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all font-black text-primary focus:border-accent" placeholder="e.g. 50000.00" />
                            {errors.allocatedAmount && <p className="text-xs text-danger-500 font-bold mt-1">{errors.allocatedAmount.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={allocateMutation.isPending}
                            className={`w-full py-4 mt-2 rounded-xl font-black tracking-widest text-white shadow-xl transition-all ${
                                allocateMutation.isPending ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:-translate-y-0.5 hover:shadow-primary/30'
                            }`}
                        >
                            {allocateMutation.isPending ? 'Propagating DB Request...' : 'Allocate Regional Reserve Pool'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};
