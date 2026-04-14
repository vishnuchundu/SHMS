import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  WalletCards,
  MessageSquareWarning,
  Bed,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Building,
  CheckSquare,
  BadgeDollarSign,
  Landmark,
  FileDigit,
  Shield,
  LayoutDashboard,
  X
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const { user } = useAuth();
  if (!user) return null;

  // Defining the exact layout specifications mapping the JWT variables strictly
  const rawMenuConfig = [
    // STUDENT MAPPINGS
    {
      title: 'Student Dashboard',
      allowedRoles: ['ROLE_STUDENT'],
      items: [
        { name: 'My Dues', path: '/student/dues', icon: WalletCards },
        { name: 'Lodge Complaint', path: '/student/complaints', icon: MessageSquareWarning },
        { name: 'My Allotment', path: '/student/allotment', icon: Bed },
      ],
    },
    // CLERK MAPPINGS
    {
      title: 'Clerk Operations',
      allowedRoles: ['ROLE_HALL_CLERK', 'ROLE_ADMIN'],
      items: [
        { name: 'Admissions', path: '/clerk/admissions', icon: UserCheck },
        { name: 'Staff Attendance', path: '/clerk/attendance', icon: CalendarCheck },
        { name: 'Record Payments', path: '/clerk/payments', icon: CreditCard },
      ],
    },
    {
      title: 'Warden Controls',
      allowedRoles: ['ROLE_HALL_WARDEN', 'ROLE_CONTROLLING_WARDEN', 'ROLE_MESS_MANAGER', 'ROLE_ADMIN'],
      items: [
        { name: 'Occupancy Map', path: '/warden/occupancy', icon: Building },
        { name: 'Complaint ATR', path: '/warden/atr', icon: CheckSquare },
        { name: 'Mess Billing', path: '/warden/mess', icon: WalletCards },
        { name: 'Regional Payroll', path: '/warden/payroll', icon: FileDigit },
        { name: 'Hall Expenses', path: '/warden/expenses', icon: BadgeDollarSign },
      ],
    },
    // HIGH COMMAND / CHAIRMAN
    {
      title: 'Admin Suite',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_CHAIRMAN'],
      items: [
        { name: 'Chairman Analytics', path: '/admin/chairman', icon: Landmark },
        { name: 'User Access', path: '/admin/users', icon: Shield },
        { name: 'Audit Logs', path: '/admin/logs', icon: LayoutDashboard },
      ],
    },
  ];

  // Logic rendering ONLY arrays matching intersecting boundaries!
  const filteredBlocks = rawMenuConfig.filter((block) => 
    user.roles.some((r) => block.allowedRoles.includes(r))
  );

  return (
    <>
      {/* Mobile Dim Overlay isolating z-index layouts dropping focus purely onto navigation */}
      {isMobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-primary to-[#1f2b3b] text-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen shadow-2xl border-r border-[#3d5470] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 h-20 border-b border-white/10 lg:hidden focus:outline-none">
          <span className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg"><span className="text-white text-lg">S</span></div>
              SHMS
          </span>
          <button onClick={closeMobileMenu} className="p-1 rounded-md hover:bg-white/10 text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 hide-scrollbar custom-scroll">
          {filteredBlocks.map((block, idx) => (
            <div key={idx} className="mb-8 px-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                {block.title}
              </h3>
              <nav className="space-y-1">
                {block.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${
                          isActive
                            ? 'bg-accent/10 border border-accent/30 text-accent shadow-lg shadow-accent/10'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`
                      }
                    >
                      <Icon
                        size={20}
                        className={`transition-colors duration-300 ${
                          item.path === location.pathname ? 'text-accent' : 'group-hover:text-warning'
                        }`}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        
        {/* Native branding bounding resolving explicit dark layouts cleanly */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex flex-col items-center">
             <div className="w-full flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500 tracking-widest font-black uppercase">SHMS Core Module</p>
                   <p className="text-[10px] text-gray-600 font-bold tracking-wider mt-0.5" >SECURE PROXY ENVIRONMENT</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
             </div>
        </div>
      </aside>
    </>
  );
};
