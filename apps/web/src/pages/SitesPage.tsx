import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { constructionSiteService } from '@/services/api';
import { 
  HardHat, 
  Search, 
  Plus, 
  MapPin, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Clock,
  Loader2,
  Building2
} from 'lucide-react';

export default function SitesPage() {
  const [search, setSearch] = useState('');
  
  const { data: sites, isLoading } = useQuery({
    queryKey: ['construction-sites'],
    queryFn: constructionSiteService.getAll
  });

  const filteredSites = (sites || []).filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contractor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <HardHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Suivi des Chantiers</h1>
            <p className="text-xs text-gray-500">Monitoring de l'activité BTP</p>
          </div>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors">
          <Plus size={20} />
          <span>Nouveau Chantier</span>
        </button>
      </div>

      {/* List container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un chantier..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={search}
              onChange={v => setSearch(v.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-white">
            <Filter size={18} />
            <span>Étapes</span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Chargement des chantiers...</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Aucun chantier enregistré</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site: any) => (
              <div key={site.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-50 text-orange-600 p-2 rounded-xl">
                      <Building2 size={24} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${getStatusColor(site.status?.name)}`}>
                      {site.status?.name}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{site.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                    <MapPin size={12} /> {site.city?.name}, {site.fullAddress}
                  </div>

                  <div className="space-y-3 py-4 border-y border-gray-50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Propriétaire</span>
                      <span className="font-bold text-gray-700">{site.contractor}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Étape</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        <TrendingUp size={12} className="text-green-500" /> {site.stage?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <Clock size={12} /> {new Date(site.createdAt).toLocaleDateString()}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'ACTIF': return 'bg-green-100 text-green-700';
    case 'SUSPENDU': return 'bg-red-100 text-red-700';
    case 'TERMINE': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
