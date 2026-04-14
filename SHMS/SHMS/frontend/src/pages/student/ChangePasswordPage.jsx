import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ChangePasswordPage = () => {
  const { logout } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [done, setDone]               = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => axiosInstance.post('/api/auth/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      setDone(true);
      // Force re-login so the new JWT (mustChangePassword=false) is issued
      setTimeout(() => logout(), 2500);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/20 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-accent text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/30 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <KeyRound size={36} />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Set Your Password</h1>
          <p className="text-gray-500 font-medium mt-2 text-sm">
            Your account was created with a temporary password.<br />
            Please set a personal password to continue.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
              <CheckCircle2 className="text-green-500" size={56} />
              <p className="text-xl font-black text-green-700">Password Updated!</p>
              <p className="text-sm text-gray-500 text-center">Redirecting to login momentarily...</p>
            </div>
          ) : (
            <>
              {mutation.isError && (
                <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-100 flex items-start gap-3">
                  <AlertCircle className="text-danger-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-danger-700 text-sm font-semibold">
                    {mutation.error?.response?.data?.message || 'Failed to change password. Please try again.'}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 tracking-wide">CURRENT PASSWORD</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      {...register('currentPassword')}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-gray-50 focus:bg-white transition outline-none focus:ring-2 ${errors.currentPassword ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-accent focus:ring-accent/20'}`}
                      placeholder="Your temporary password"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-danger-500 font-bold">{errors.currentPassword.message}</p>}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 tracking-wide">NEW PASSWORD</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type={showNew ? 'text' : 'password'}
                      {...register('newPassword')}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-gray-50 focus:bg-white transition outline-none focus:ring-2 ${errors.newPassword ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-accent focus:ring-accent/20'}`}
                      placeholder="Minimum 6 characters"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-danger-500 font-bold">{errors.newPassword.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 tracking-wide">CONFIRM NEW PASSWORD</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition outline-none focus:ring-2 ${errors.confirmPassword ? 'border-danger-400 focus:ring-danger-200' : 'border-gray-200 focus:border-accent focus:ring-accent/20'}`}
                      placeholder="Re-enter new password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-danger-500 font-bold">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-4 rounded-xl font-black text-white bg-accent hover:bg-orange-600 shadow-lg shadow-accent/20 transition-all disabled:opacity-60 mt-2"
                >
                  {mutation.isPending ? 'Securing...' : 'Set My Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
