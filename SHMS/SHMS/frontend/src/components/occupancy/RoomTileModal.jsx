import { X, User } from 'lucide-react';

export const RoomTileModal = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden transform transition-all p-6">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">Room {room.roomNumber}</h2>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">
              {room.capacity === 1 ? 'Single Occupancy' : 'Twin Sharing'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-danger/10 text-gray-500 hover:text-danger rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Active Assignees ({room.currentOccupancy}/{room.capacity})
          </h3>
          
          {room.occupants && room.occupants.length > 0 ? (
            <ul className="space-y-3">
              {room.occupants.map((student, idx) => (
                <li key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <User size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{student.name}</h4>
                    <span className="text-xs font-semibold text-accent tracking-wide bg-accent/10 px-2 py-0.5 rounded">
                      ID: {student.id}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">This room is completely vacant.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
