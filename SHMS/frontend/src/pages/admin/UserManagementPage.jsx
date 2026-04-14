import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Users, UserPlus, Trash2, Shield, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import { Loader } from '../../components/Loader';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

export const UserManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/admin/users');
      return data;
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post('/api/admin/users', payload);
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setTimeout(() => setSuccess(false), 4000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axiosInstance.delete(`/api/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
  });

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full space-y-8">
      
      <div className="bg-gradient-to-r from-gray-900 to-[#1f2b3b] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden border border-gray-700">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[60px] mix-blend-screen pointer-events-none" />
         <div className="relative z-10 flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                    <Users className="text-primary" size={24} />
                 </div>
                 Master Access Suite
               </h1>
               <p className="text-gray-300 mt-3 font-medium tracking-wide">Secure physical injection mapping granting Role Based Architectural execution controls.</p>
            </div>
            <ShieldCheck size={64} className="text-primary/30" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
               <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                 <UserPlus className="text-primary" size={24} /> Register Identity
               </h2>
               
               {!isAdmin && (
                 <div className="p-3 mb-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg text-sm text-yellow-700 font-bold animate-fade-in">
                    Creation visually locked inherently. Root Admin execution role physically required.
                 </div>
               )}

               {success && (
                 <div className="p-3 mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-sm text-green-700 font-bold animate-fade-in">
                    Mapped Account Securely natively.
                 </div>
               )}
               {createMutation.isError && (
                 <div className="p-3 mb-6 bg-red-50 border-l-4 border-danger-500 rounded-r-lg text-sm text-danger-700 font-bold animate-fade-in">
                    {createMutation.error?.response?.data?.message || 'Access creation blocked dynamically.'}
                 </div>
               )}

               <form onSubmit={handleSubmit(createMutation.mutate)} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-wider">USERNAME IDENTIFIER</label>
                    <input 
                      {...register("username", { required: true })}
                      placeholder="e.g. john_doe"
                      className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-wider">SECURE PASSWORD</label>
                    <input 
                      type="password"
                      {...register("password", { required: true })}
                      placeholder="••••••••"
                      className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 tracking-wider">SYSTEM AUTHORITY BOUNDARY</label>
                    <div className="relative mt-1">
                      <Shield className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <select 
                        {...register("role")}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-gray-700 cursor-pointer"
                      >
                        <option value="STUDENT">Student Access</option>
                        <option value="HALL_CLERK">Hall Clerk Protocol</option>
                        <option value="ACCOUNTS_CLERK">Accounts Logic</option>
                        <option value="HALL_WARDEN">Warden Overrides</option>
                        <option value="MESS_MANAGER">Mess Batch Controls</option>
                        <option value="CHAIRMAN">Chairman Analytics</option>
                        <option value="ADMIN">Root Administrator</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    disabled={createMutation.isPending || !isAdmin}
                    type="submit" 
                    className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all mt-4 ${createMutation.isPending || !isAdmin ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-gray-800'}`}
                  >
                    {!isAdmin ? 'Insufficient Root Bounds' : 'Forge Structural Authorization'}
                  </button>
               </form>
            </div>
         </div>

         <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 tracking-wide">Active System Identities ({users?.length})</h3>
                  <div className="relative w-64 text-gray-400 focus-within:text-primary transition-colors">
                     <Search className="absolute left-3 top-2.5" size={18} />
                     <input placeholder="Filter hashes..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-primary/30 focus:bg-white rounded-lg outline-none text-sm font-medium transition" />
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-widest border-b border-gray-100">
                     <tr>
                       <th className="px-6 py-4">Internal Hash (ID)</th>
                       <th className="px-6 py-4">Username</th>
                       <th className="px-6 py-4">Execution Vector</th>
                       <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 text-sm font-medium">
                     {users && users.map(u => (
                       <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                         <td className="px-6 py-4 text-gray-400 font-mono text-xs">{u.id || '-'}</td>
                         <td className="px-6 py-4 text-gray-800 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                              {(u.username || 'U').substring(0,2).toUpperCase()}
                           </div>
                           {u.username || 'Unknown'}
                         </td>
                         <td className="px-6 py-4">
                           <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-danger-100 text-danger-700' : 'bg-primary/10 text-primary'}`}>
                             {(u.role || 'UNKNOWN').replace('_', ' ')}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {deleteMutation.isError && deleteMutation.variables === u.id && (
                               <span className="text-xs text-danger-500 font-bold py-2 px-1">Access Denied</span>
                            )}
                            <button 
                              disabled={!isAdmin}
                              onClick={() => {
                                 if (window.confirm('Definitively destroy user network constraint block intrinsically?')) {
                                   deleteMutation.mutate(u.id);
                                 }
                              }}
                              className={`p-2 rounded-lg transition ${isAdmin ? 'text-gray-400 hover:text-danger-500 hover:bg-danger-50' : 'text-gray-200 cursor-not-allowed'}`}
                              title={isAdmin ? "Destroy structural mapping" : "Require Admin Execution"}
                            >
                              <Trash2 size={18} />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};
