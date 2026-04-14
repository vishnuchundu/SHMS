import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import { Building, Users, AlertCircle, BedDouble, BedSingle } from 'lucide-react';

export const OccupancyMapPage = () => {

  const { data: rooms, isLoading, isError } = useQuery({
    queryKey: ['occupancy', 'HALL-A'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/rooms/hall/HALL-A');
      return response.data;
    },
    refetchInterval: 15000 // Real-time polling
  });

  const getTileColor = (room) => {
    if (room.currentOccupancy === 0) return 'bg-green-500 hover:bg-green-600 shadow-green-500/20';
    if (room.currentOccupancy >= room.capacity) return 'bg-red-500 hover:bg-red-600 shadow-red-500/20';
    if (room.capacity === 2 && room.currentOccupancy === 1) return 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/20 text-gray-900';
    return 'bg-gray-200'; // Fallback
  };

  const calculateCounters = () => {
     if (!rooms) return { total: 0, vacant: 0, partial: 0, full: 0 };
     let vacant = 0, partial = 0, full = 0;
     rooms.forEach(r => {
        if (r.currentOccupancy === 0) vacant++;
        else if (r.currentOccupancy >= r.capacity) full++;
        else partial++;
     });
     return { total: rooms.length, vacant, partial, full };
  };

  const counters = calculateCounters();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in text-gray-800">
      
      {/* Implemented Glassmorphism Theme mapping Primary Layouts */}
      <div className="mb-8 p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl relative overflow-hidden text-white border border-gray-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[60px] mix-blend-plus-lighter pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <Building className="text-accent" size={24} /> 
               </div>
               Live Occupancy Map
             </h1>
             <p className="text-gray-300 mt-3 font-medium tracking-wide">Dynamic real-time visualization grid mapping exact physical bounds across HALL-A.</p>
           </div>
        </div>
      </div>

      {isError && (
        <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-4 animate-fade-in shadow-sm">
          <AlertCircle className="text-danger-500 mt-0.5" size={24} />
          <div>
            <h3 className="text-danger-800 font-bold">API Synchronization Failure</h3>
            <p className="text-danger-700 text-sm mt-1 font-medium">Failed to fetch /api/rooms/hall/HALL-A. Ensure RoomController is active natively.</p>
          </div>
        </div>
      )}

      {/* Legend / Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Rooms</span>
            <span className="text-2xl font-black text-primary">{counters.total}</span>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Fully Vacant</span>
            <span className="text-2xl font-black text-green-500">{counters.vacant}</span>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Fully Occupied</span>
            <span className="text-2xl font-black text-red-500">{counters.full}</span>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Partial (1 Left)</span>
            <span className="text-2xl font-black text-yellow-500">{counters.partial}</span>
         </div>
      </div>

      {/* Physical Grid mapping securely tracking vector boundaries directly outputting Tailwinds explicitly */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Physical Level 1 Matrix</h2>
        
        {rooms && rooms.length === 0 ? (
           <p className="text-gray-400 font-bold flex items-center gap-2"><AlertCircle size={16}/> No structural instances generated in Database.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {rooms?.map((room) => (
              <div 
                key={room.id}
                className={`relative group rounded-xl p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center cursor-default ${getTileColor(room)} ${room.currentOccupancy === 1 && room.capacity === 2 ? 'text-gray-900 border-yellow-500' : 'text-white border-white/20'}`}
              >
                  <span className="text-[10px] font-black tracking-widest mb-1 opacity-80">{room.roomType}</span>
                  <span className="font-bold text-lg mb-2">{room.roomNumber}</span>
                  
                  <div className="flex items-center gap-1 opacity-90">
                     <Users size={16} />
                     <span className="text-sm font-black font-mono">{room.currentOccupancy}/{room.capacity}</span>
                  </div>

                  {/* Absolute positioning mapping strict UX details bounding popups entirely strictly securely */}
                  <div className="absolute inset-0 bg-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm pointer-events-none p-2 space-y-1">
                      <span className="text-xs font-bold text-gray-300">RENT VALUATION</span>
                      <span className="text-sm font-black whitespace-nowrap text-warning">₹{room.rentAmount} / mo</span>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
