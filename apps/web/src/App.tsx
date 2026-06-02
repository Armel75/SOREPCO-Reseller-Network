import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  Users, 
  HardHat, 
  Map as MapIcon, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  PlusCircle,
  Bell,
  Settings
} from 'lucide-react';

import ResellersPage from './pages/ResellersPage';
import SitesPage from './pages/SitesPage';
import GeolocationPage from './pages/GeolocationPage';
import SiteForm from './pages/mobile/SiteForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const queryClient = new QueryClient();

const Layout = ({ children, user, onLogout }: { children: React.ReactNode, user: any, onLogout: () => void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Tableau de Bord', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Revendeurs', icon: <Users size={20} />, path: '/resellers' },
    { name: 'Chantiers BTP', icon: <HardHat size={20} />, path: '/sites' },
    { name: 'Géolocalisation', icon: <MapIcon size={20} />, path: '/geo' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative z-50`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black italic">S</div>
            <span className="font-black text-xl tracking-tighter text-gray-900">SOREPCO</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                location.pathname === item.path 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span className={`${!isSidebarOpen && 'hidden'} whitespace-nowrap`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm`}
          >
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
             <span className="text-xs font-black text-gray-300 uppercase tracking-widest mr-2">Session:</span>
             <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                Live
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
               <Bell size={20} />
               <div className="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
               <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-black text-gray-900 leading-none">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">{user?.role} - SOREPCO SA</div>
              </div>
              <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-black uppercase">
                {user?.firstName?.substring(0, 1)}{user?.lastName?.substring(0, 1)}
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-8">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-500 font-medium mt-1">Résumé de l'activité du réseau SOREPCO</p>
      </div>
      <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-widest">
         Mis à jour: {new Date().toLocaleTimeString()}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard title="Revendeurs" value="124" trend="+12%" icon={<Users className="text-blue-600" />} />
      <DashboardCard title="Chantiers" value="48" trend="+5%" icon={<HardHat className="text-orange-600" />} />
      <DashboardCard title="Visites" value="3,204" trend="+18%" icon={<LayoutDashboard className="text-purple-600" />} />
      <DashboardCard title="Alertes" value="5" trend="-2%" icon={<Bell className="text-red-600" />} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-300 italic border-dashed">
         Graphique de performance (Recharts) sera affiché ici
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
         <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Activités Récentes</h3>
         <div className="space-y-6">
            <ActivityItem text="Nouveau revendeur: Ets. Douala" time="2h" />
            <ActivityItem text="Visite de chantier validée: BTP-0043" time="4h" />
            <ActivityItem text="Alerte stock: Ciment SOREPCO 50kg" time="5h" color="text-red-500" />
            <ActivityItem text="Nouveau prospect: Chantier M. Atangana" time="1j" />
         </div>
      </div>
    </div>
  </div>
);

function DashboardCard({ title, value, trend, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">{title}</div>
    </div>
  );
}

function ActivityItem({ text, time, color = 'text-gray-600' }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-2 w-2 rounded-full bg-orange-600 mt-1.5 shrink-0" />
      <div className="flex-1">
        <p className={`text-sm font-bold ${color}`}>{text}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase">{time} ago</p>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('sorepco_token');
    const userData = localStorage.getItem('sorepco_user');
    if (token) {
      setIsAuthenticated(true);
      if (userData) setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sorepco_token');
    localStorage.removeItem('sorepco_user');
    window.location.href = '/login';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          
          <Route path="/" element={isAuthenticated ? <Layout user={user} onLogout={handleLogout}><Dashboard /></Layout> : <Navigate to="/login" />} />
          <Route path="/resellers" element={isAuthenticated ? <Layout user={user} onLogout={handleLogout}><ResellersPage /></Layout> : <Navigate to="/login" />} />
          <Route path="/sites" element={isAuthenticated ? <Layout user={user} onLogout={handleLogout}><SitesPage /></Layout> : <Navigate to="/login" />} />
          <Route path="/geo" element={isAuthenticated ? <Layout user={user} onLogout={handleLogout}><GeolocationPage /></Layout> : <Navigate to="/login" />} />
          
          <Route path="/mobile/site-new" element={isAuthenticated ? <SiteForm onBack={() => window.history.back()} /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
