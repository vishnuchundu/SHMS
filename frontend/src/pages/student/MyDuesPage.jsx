import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/Loader';
import { WalletCards, Home, UtensilsCrossed, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Mocking fetching since there is no native endpoint
const fetchStudentDues = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messDue: 12500.0,
        rentDue: 4500.0,
        amenitiesDue: 1200.0,
      });
    }, 800); // Simulated network delay
  });
};

export const MyDuesPage = () => {
  const { user } = useAuth();

  const { data: dues, isLoading, isError } = useQuery({
    queryKey: ['studentDues', user?.id],
    queryFn: () => fetchStudentDues(user?.id),
    staleTime: 50000,
  });

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-8 text-center text-danger-500 font-bold">Failed to load dues network structural breakdown in query boundaries.</div>;

  const totalDue = dues.messDue + dues.rentDue + dues.amenitiesDue;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in w-full max-w-6xl mx-auto">
      <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
        <div className="absolute top-0 right-0 w-48 h-48 bg-warning/20 rounded-full blur-[50px] mix-blend-plus-lighter pointer-events-none" />
        <div className="relative z-10">
           <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
             <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <WalletCards className="text-warning" size={24} />
             </div>
             Unified Ledger Display
           </h1>
           <p className="text-gray-300 mt-3 font-medium tracking-wide">Secure view into mathematical breakdown of pending financial clearances structurally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
             <p className="text-sm font-semibold text-gray-500 tracking-wider">MESS CHARGES</p>
             <p className="text-2xl font-bold text-primary mt-1">₹{dues.messDue.toLocaleString()}</p>
           </div>
           <div className="p-3 rounded-lg bg-orange-50 text-accent">
              <UtensilsCrossed size={24} />
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
             <p className="text-sm font-semibold text-gray-500 tracking-wider">ROOM RENT</p>
             <p className="text-2xl font-bold text-primary mt-1">₹{dues.rentDue.toLocaleString()}</p>
           </div>
           <div className="p-3 rounded-lg bg-blue-50 text-blue-500">
              <Home size={24} />
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
             <p className="text-sm font-semibold text-gray-500 tracking-wider">AMENITIES</p>
             <p className="text-2xl font-bold text-primary mt-1">₹{dues.amenitiesDue.toLocaleString()}</p>
           </div>
           <div className="p-3 rounded-lg bg-yellow-50 text-warning">
              <Zap size={24} />
           </div>
        </div>
      </div>

      <div className="bg-gray-50 overflow-hidden rounded-xl border-2 border-danger-100 p-8 flex flex-col md:flex-row items-center justify-between mt-8 relative">
         <div className="absolute top-0 right-0 p-8 opacity-5">
             <WalletCards size={120} />
         </div>
         <div className="flex items-center gap-4 z-10">
             <div className="p-4 rounded-full bg-danger-100 text-danger-500 shadow-sm">
                 <WalletCards size={32} />
             </div>
             <div>
                 <h2 className="text-xl font-bold text-gray-800">Total Outstanding Due</h2>
                 <p className="text-sm text-gray-500 font-medium">Please clear these dues before the 15th of the month to avoid late fee penalties.</p>
             </div>
         </div>
         <div className="mt-6 md:mt-0 text-right z-10">
             <span className="text-4xl lg:text-5xl font-black text-danger-500 tracking-tighter drop-shadow-sm">₹{totalDue.toLocaleString()}</span>
         </div>
      </div>
    </div>
  );
};
