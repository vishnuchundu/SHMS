import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Loader } from '../../components/Loader';
import {
  Home, Building2, BedDouble, BedSingle, Users, ShieldCheck,
  ShieldAlert, Zap, IndianRupee, Hash, BookOpen
} from 'lucide-react';

const fetchAllotment = async () => {
  const res = await axiosInstance.get('/api/students/my-allotment');
  return res.data;
};

const InfoCard = ({ icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl shrink-0 ${accent}`}>{icon}</div>
    <div>
      <p className="text-xs font-black text-gray-400 tracking-widest uppercase">{label}</p>
      <p className="text-lg font-black text-primary mt-0.5">{value}</p>
    </div>
  </div>
);

export const MyAllotmentPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['myAllotment'],
    queryFn: fetchAllotment,
    staleTime: 60000,
  });

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldAlert className="text-danger-500" size={48} />
        <p className="text-xl font-black text-danger-500">Failed to load allotment details.</p>
        <p className="text-gray-500 text-sm">Your student profile may not be linked to a room yet. Contact the administrator.</p>
      </div>
    );
  }

  const statusClear = data.duesStatus === 'CLEAR';

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in w-full max-w-5xl mx-auto">

      {/* Hero Header */}
      <div className="relative p-8 bg-gradient-to-r from-primary to-[#1f2b3b] rounded-3xl shadow-xl text-white border border-gray-700 overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-20px] w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                <Home className="text-accent" size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">My Room Allotment</h1>
            </div>
            <p className="text-gray-300 text-sm font-medium">
              Verified room assignment for <span className="text-white font-black">{data.studentName}</span>
            </p>
          </div>

          {/* Dues status badge */}
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm border backdrop-blur-sm shrink-0 ${
            statusClear
              ? 'bg-green-500/20 border-green-400/30 text-green-300'
              : 'bg-danger-500/20 border-danger-400/30 text-red-300'
          }`}>
            {statusClear
              ? <><ShieldCheck size={18} /> DUES CLEAR</>
              : <><ShieldAlert size={18} /> DUES PENDING</>
            }
          </div>
        </div>
      </div>

      {/* Room & Hall Details Grid */}
      <div>
        <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-accent" /> Hall & Room Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            icon={<Building2 size={22} className="text-primary" />}
            label="Hall Name"
            value={data.hallName}
            accent="bg-primary/10"
          />
          <InfoCard
            icon={<BookOpen size={22} className="text-blue-500" />}
            label="Hall Type"
            value={data.hallType}
            accent="bg-blue-50"
          />
          <InfoCard
            icon={<Hash size={22} className="text-indigo-500" />}
            label="Room Number"
            value={data.roomNumber}
            accent="bg-indigo-50"
          />
          <InfoCard
            icon={data.roomType === 'SINGLE'
              ? <BedSingle size={22} className="text-purple-500" />
              : <BedDouble size={22} className="text-purple-500" />}
            label="Room Type"
            value={data.roomType === 'SINGLE' ? 'Single Occupancy' : 'Twin Sharing'}
            accent="bg-purple-50"
          />
          <InfoCard
            icon={<Users size={22} className="text-teal-500" />}
            label="Occupancy"
            value={`${data.currentOccupancy} / ${data.capacity} occupied`}
            accent="bg-teal-50"
          />
          <InfoCard
            icon={<Zap size={22} className="text-warning" />}
            label="Amenity Charge / Month"
            value={`₹${Number(data.amenityCharge).toLocaleString()}`}
            accent="bg-yellow-50"
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div>
        <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
          <IndianRupee size={20} className="text-accent" /> Financial Breakdown
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Charge</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">Monthly Room Rent</td>
                <td className="px-6 py-4 text-right font-black text-primary">₹{Number(data.rentAmount).toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">Amenities Charge</td>
                <td className="px-6 py-4 text-right font-black text-primary">₹{Number(data.amenityCharge).toLocaleString()}</td>
              </tr>
              <tr className="bg-primary/5 font-black">
                <td className="px-6 py-4 text-primary">Total Monthly Cost</td>
                <td className="px-6 py-4 text-right text-primary text-base">
                  ₹{(Number(data.rentAmount) + Number(data.amenityCharge)).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="text-center text-xs text-gray-400 font-medium pb-4">
        Room allotments are managed by the Hall Clerk. Contact administration for any discrepancies.
      </div>
    </div>
  );
};
