import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoomTileModal } from '../components/occupancy/RoomTileModal';
import { Loader } from '../components/Loader';
import { Info } from 'lucide-react';

const MOCK_FETCH_ROOMS = async () => {
  // Simulates network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    { id: 'R1', roomNumber: '101', capacity: 1, currentOccupancy: 0, occupants: [] },
    { id: 'R2', roomNumber: '102', capacity: 2, currentOccupancy: 1, occupants: [{ id: 'S1044', name: 'Alwyn D.' }] },
    { id: 'R3', roomNumber: '103', capacity: 2, currentOccupancy: 2, occupants: [{ id: 'S1099', name: 'Raj Kumar' }, { id: 'S1101', name: 'Vishnu C.' }] },
    { id: 'R4', roomNumber: '104', capacity: 1, currentOccupancy: 1, occupants: [{ id: 'S1234', name: 'John Doe' }] },
    { id: 'R5', roomNumber: '105', capacity: 1, currentOccupancy: 0, occupants: [] },
    { id: 'R6', roomNumber: '106', capacity: 2, currentOccupancy: 0, occupants: [] },
    { id: 'R7', roomNumber: '107', capacity: 2, currentOccupancy: 2, occupants: [{ id: 'S3332', name: 'Arjun N.' }, { id: 'S3333', name: 'Rahul V.' }] },
    { id: 'R8', roomNumber: '201', capacity: 2, currentOccupancy: 1, occupants: [{ id: 'S4001', name: 'Karthik S.' }] },
    { id: 'R9', roomNumber: '202', capacity: 1, currentOccupancy: 1, occupants: [{ id: 'S4211', name: 'Sammy W.' }] },
    { id: 'R10', roomNumber: '203', capacity: 1, currentOccupancy: 0, occupants: [] },
    { id: 'R11', roomNumber: '204', capacity: 2, currentOccupancy: 2, occupants: [{ id: 'S9001', name: 'Chris P.' }, { id: 'S9002', name: 'Dave B.' }] },
    { id: 'R12', roomNumber: '205', capacity: 2, currentOccupancy: 0, occupants: [] },
  ];
};

export const OccupancyMapPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['warden-occupancy-map'],
    queryFn: MOCK_FETCH_ROOMS,
  });

  if (isLoading) return <Loader message="Compiling Hall Occupancy Grid..." />;

  const getTileColorEngine = (room) => {
    if (room.currentOccupancy === 0) {
      return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
    }
    if (room.currentOccupancy > 0 && room.currentOccupancy < room.capacity) {
      return 'bg-warning/20 border-warning text-yellow-800 hover:bg-warning/30 hover:border-yellow-500 shadow-[0_0_15px_rgba(255,212,96,0.2)]';
    }
    return 'bg-danger/10 border-danger/40 text-danger hover:bg-danger/20 hover:border-danger/60 shadow-[0_0_15px_rgba(234,84,85,0.15)]';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Occupancy Visual Grid</h1>
          <p className="text-gray-500 font-medium mt-1">Live mapping executing capacities distinctly across active Halls.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Vacant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full</span>
          </div>
        </div>
      </div>

      {/* Grid Execution Bounds */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {rooms && rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${getTileColorEngine(room)}`}
            >
              <span className="text-2xl font-black mb-1">{room.roomNumber}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {room.currentOccupancy}/{room.capacity} FILLED
              </span>
              
              {/* Optional indicator catching info interactions */}
              <div className="absolute top-2 right-2 opacity-50">
                 <Info size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedRoom && (
        <RoomTileModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
      
    </div>
  );
};
