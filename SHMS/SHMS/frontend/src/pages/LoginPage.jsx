import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Loader2, KeyRound, User as UserIcon } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, "Username explicitly required mapped to your registered parameters."),
  password: z.string().min(5, "Password validation boundary dictates 5 characters minimum."),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setGlobalError(null);
    try {
      await login(data);
    } catch (err) {
      setGlobalError(
        err.response?.data?.message || "Invalid authentication trace securely blocked."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/20 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-warning/20 rounded-full blur-[120px] mix-blend-multiply opacity-70 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 px-4 md:px-0 animate-fade-in">
        
        {/* Abstract Header Branding */}
        <div className="text-center mb-8">
           <div className="mx-auto w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
               <span className="text-4xl font-black tracking-tighter">S</span>
           </div>
           <h1 className="text-4xl font-black text-primary tracking-tight">SHMS Gateway</h1>
           <p className="text-gray-500 font-medium mt-2 text-sm tracking-wide">STUDENTS' HOSTEL MANAGEMENT SYSTEM</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
          
          {globalError && (
            <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-100">
              <p className="text-danger-600 text-sm font-bold flex items-center gap-2">
                 <span className="w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center shrink-0">!</span>
                 {globalError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Input Groups */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <UserIcon size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-primary font-medium ${
                    errors.username ? 'border-danger-400 bg-danger-50' : 'border-gray-200'
                  } focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 outline-none`}
                  placeholder="Username (e.g. S12345)"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.username.message}</p>
                )}
              </div>

              <div className="relative border-b-2 border-transparent focus-within:border-accent transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <KeyRound size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-primary font-bold tracking-widest ${
                    errors.password ? 'border-danger-400 bg-danger-50' : 'border-gray-200'
                  } focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 outline-none`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center group overflow-hidden relative"
            >
              {/* Highlight sweep animation mapped logically */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
              
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? 'Authenticating Structure...' : 'Secure Node Access'}
            </button>
            
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-400 font-bold tracking-widest mt-8 uppercase">
           Restricted Portal Environment
        </p>
      </div>
    </div>
  );
};
