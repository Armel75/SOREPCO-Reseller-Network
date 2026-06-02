import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resellerService } from '@/services/api';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Filter, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function ResellersPage() {
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['resellers', search],
    queryFn: () => resellerService.getAll({ search })
  });

  const resellers = data?.items || [];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Suivi des Revendeurs</h1>
            <p className="text-xs text-gray-500">Gestion et performance du réseau</p>
          </div>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors">
          <Plus size={20} />
          <span>Nouveau Revendeur</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <StatCard title="Total Revendeurs" value={data?.total || 0} icon={<Users />} color="bg-blue-500" />
        <StatCard title="Commandes du mois" value="1.2M CFA" icon={<TrendingUp />} color="bg-green-500" />
        <StatCard title="Alertes Stock" value="5" icon={<AlertCircle />} color="bg-red-500" />
      </div>

      {/* Search & Filter */}
      <div className="px-6 mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, code ou propriétaire..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            value={search}
            onChange={v => setSearch(v.target.value)}
          />
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-white transition-colors">
          <Filter size={18} />
          <span>Filtres</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 px-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Chargement des revendeurs...</p>
          </div>
        ) : resellers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Aucun revendeur trouvé</p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {resellers.map((reseller: any) => (
              <div key={reseller.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 font-bold group-hover:bg-orange-50 group-hover:text-orange-600">
                      {reseller.businessName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{reseller.businessName}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-mono">{reseller.resellerCode}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {reseller.city?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 border px-2 py-1 rounded bg-orange-50 text-orange-700">
                        {reseller.resellerLevel?.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">NIVEAU</div>
                    </div>
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl text-white`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</div>
      </div>
    </div>
  );
}
