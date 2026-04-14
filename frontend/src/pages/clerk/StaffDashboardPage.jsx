import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const leaveSchema = z.object({
  staffId: z.string().min(1, "Target Staff ID is natively required for mapping."),
  absenceDate: z.string().min(1, "Specific explicit discrete boundary required."),
  reason: z.string().min(5, "Reason justification requires valid textual string context."),
});

export const StaffDashboardPage = () => {
    const queryClient = useQueryClient();
    const [successMsg, setSuccessMsg] = useState(null);

    const { data: staffList, isLoading, isError } = useQuery({
        queryKey: ['staff', 'HALL-A'],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/hr/staff/hall/HALL-A');
            return response.data;
        }
    });

    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
        resolver: zodResolver(leaveSchema)
    });

    const leaveMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post('/api/hr/leave/record', {
                ...payload,
                clerkHallId: 'HALL-A',
                absenceDate: new Date(payload.absenceDate).toISOString().split('T')[0]
            });
            return response.data;
        },
        onSuccess: () => {
             setSuccessMsg("Temporal Staff Leave successfully recorded logically.");
             reset();
             setTimeout(() => setSuccessMsg(null), 5000);
        }
    });

    if (isLoading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto animate-fade-in text-gray-800 p-4 md:p-8">
            
            <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[60px] mix-blend-plus-lighter pointer-events-none" />
              <div className="relative z-10">
                 <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                   <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                      <Users className="text-accent" size={24} /> 
                   </div>
                   Clerk HR Extranet
                 </h1>
                 <p className="text-gray-300 mt-3 font-medium tracking-wide">Secure view indexing Active Hall Staff alongside temporal automated absent logging variables.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Active Staff Grid bounds */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:p-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Hall Ground Crew Directory</h2>
                    {isError ? (
                        <div className="p-4 bg-danger/10 text-danger-600 rounded-xl font-bold flex items-center gap-2">
                             <AlertCircle size={20}/>
                             <span>API Synchronization Blocked</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {staffList?.map((staff) => (
                                 <div 
                                    key={staff.id} 
                                    onClick={() => setValue('staffId', staff.id, { shouldValidate: true })}
                                    className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between hover:bg-white hover:border-accent hover:shadow-md hover:shadow-accent/10 transition-all group cursor-pointer"
                                 >
                                     <div>
                                         <h3 className="font-bold text-primary text-lg">{staff.staffName}</h3>
                                         <p className="text-xs font-black tracking-widest text-gray-500 mt-1 uppercase group-hover:text-accent transition-colors">{staff.type}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">PROXY ID</span>
                                         <p className="font-mono text-sm text-gray-600 font-bold bg-white px-2 py-1 border border-gray-200 rounded">{staff.id}</p>
                                     </div>
                                 </div>
                             ))}
                             {staffList?.length === 0 && <p className="text-gray-400 font-medium italic">No personnel attached uniquely to Jurisdiction.</p>}
                        </div>
                    )}
                </div>

                {/* 2. Leave Execution Module */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 xl:p-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-primary"/> 
                        Record Temporal Absence
                    </h2>
                    
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold flex items-center gap-2">
                            <CheckCircle size={20}/>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {leaveMutation.isError && (
                        <div className="mb-6 p-4 bg-danger-50 text-danger-700 rounded-xl font-bold flex items-center gap-2 border border-danger-200">
                            <AlertCircle size={20}/>
                            <span>{leaveMutation.error?.response?.data?.message || leaveMutation.error?.message || "Server Error"}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(leaveMutation.mutate)} className="space-y-5">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">STAFF ID SEQUENCE</label>
                            <input {...register("staffId")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-all" placeholder="e.g. STF-ATT01" />
                            {errors.staffId && <p className="text-xs text-danger-500 font-bold tracking-wide mt-1">{errors.staffId.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">TEMPORAL ABSENCE DATE</label>
                            <input type="date" {...register("absenceDate")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent outline-none font-medium" />
                            {errors.absenceDate && <p className="text-xs text-danger-500 font-bold mt-1">{errors.absenceDate.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">JUSTIFICATION / MEDICAL / PERSONAL</label>
                            <textarea {...register("reason")} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent outline-none h-24 resize-none font-medium" placeholder="Examine cause text safely..."></textarea>
                            {errors.reason && <p className="text-xs text-danger-500 font-bold tracking-wide mt-1">{errors.reason.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={leaveMutation.isPending}
                            className={`w-full py-4 mt-2 rounded-xl font-black text-white shadow-xl transition-all ${
                                leaveMutation.isPending ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:-translate-y-0.5 hover:shadow-primary/30'
                            }`}
                        >
                            {leaveMutation.isPending ? 'Propagating DB Request...' : 'Log Absence Constraint Safely'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};
