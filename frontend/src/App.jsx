import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './layout/MainLayout';
import { Loader } from './components/Loader';

// Module 2 Components
import { AdmissionsPage } from './pages/AdmissionsPage';

// Module 3 Components
import { MyDuesPage } from './pages/student/MyDuesPage';
import { RecordPaymentPage } from './pages/clerk/RecordPaymentPage';

// Module 4 Components
import { ComplaintPage } from './pages/student/ComplaintPage';
import { AtrDashboardPage } from './pages/warden/AtrDashboardPage';

// Phase A Module Additions
import { OccupancyMapPage } from './pages/warden/OccupancyMapPage';
import { MessManagerPage } from './pages/warden/MessManagerPage';

// Phase B Module Additions
import { StaffDashboardPage } from './pages/clerk/StaffDashboardPage';
import { PayrollDashboardPage } from './pages/warden/PayrollDashboardPage';

// Phase C Module Additions
import { ChairmanDashboardPage } from './pages/admin/ChairmanDashboardPage';
import { HallExpenseTrackerPage } from './pages/warden/HallExpenseTrackerPage';

// Intelligent Root Index Redirection mapping natively against JWT roles
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.roles.includes('ROLE_STUDENT')) return <Navigate to="/student/dues" replace />;
  if (user.roles.includes('ROLE_ADMIN')) return <Navigate to="/admin/grants" replace />;
  if (user.roles.includes('ROLE_CHAIRMAN')) return <Navigate to="/admin/chairman" replace />;
  if (user.roles.includes('ROLE_HALL_CLERK')) return <Navigate to="/clerk/admissions" replace />;
  if (user.roles.includes('ROLE_HALL_WARDEN') || user.roles.includes('ROLE_CONTROLLING_WARDEN') || user.roles.includes('ROLE_MESS_MANAGER')) return <Navigate to="/warden/occupancy" replace />;

  return <Navigate to="/login" replace />; // Fallback
};

const TemporaryDashboard = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
    <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
    <p className="text-lg text-gray-500 font-medium tracking-wide">Interface structurally pending assembly.</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Mapping */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Root Role-Based Dynamic Redirection Node */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Secure Layout Environment Wrapping Navbars & Outlets */}
          <Route element={<MainLayout />}>
          
            {/* 1. STUDENT BLOCK */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
              <Route path="/student/dues" element={<MyDuesPage />} />
              <Route path="/student/complaints" element={<ComplaintPage />} />
              <Route path="/student/allotment" element={<TemporaryDashboard title="My Allotment" />} />
            </Route>
            
            {/* 2. CLERK BLOCK */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_HALL_CLERK', 'ROLE_ADMIN']} />}>
              <Route path="/clerk/admissions" element={<AdmissionsPage />} />
              <Route path="/clerk/attendance" element={<StaffDashboardPage />} />
              <Route path="/clerk/payments" element={<RecordPaymentPage />} />
            </Route>

            {/* 3. WARDEN BLOCK */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_HALL_WARDEN', 'ROLE_CONTROLLING_WARDEN', 'ROLE_MESS_MANAGER', 'ROLE_ADMIN']} />}>
              <Route path="/warden/occupancy" element={<OccupancyMapPage />} />
              <Route path="/warden/atr" element={<AtrDashboardPage />} />
              <Route path="/warden/mess" element={<MessManagerPage />} />
              <Route path="/warden/payroll" element={<PayrollDashboardPage />} />
              <Route path="/warden/expenses" element={<HallExpenseTrackerPage />} />
            </Route>

            {/* 4. ADMIN BLOCK */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_CHAIRMAN']} />}>
              <Route path="/admin/chairman" element={<ChairmanDashboardPage />} />
              <Route path="/admin/users" element={<TemporaryDashboard title="User Management" />} />
              <Route path="/admin/grants" element={<TemporaryDashboard title="Grant Distributions" />} />
              <Route path="/admin/logs" element={<TemporaryDashboard title="System Audit Logs" />} />
            </Route>

          </Route>

          {/* Fallback Isolation Mapping */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 w-full text-center p-8">
               <h1 className="text-8xl font-black text-danger mb-4 tracking-tighter shadow-sm">404</h1>
               <p className="text-2xl font-bold text-gray-800">Layout Boundary Not Mapped</p>
               <a href="/" className="mt-8 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-200">
                  Return to Dashboard
               </a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
