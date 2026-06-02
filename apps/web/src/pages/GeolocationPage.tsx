import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { resellerService, constructionSiteService } from '@/services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, HardHat, Users, Layers, Crosshair } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const resellerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const siteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function GeolocationPage() {
  const [view, setView] = useState<'ALL' | 'RESELLERS' | 'SITES'>('ALL');
  
  const { data: resellersData } = useQuery({
    queryKey: ['resellers-map'],
    queryFn: () => resellerService.getAll({ limit: 1000 })
  });

  const { data: sitesData } = useQuery({
    queryKey: ['sites-map'],
    queryFn: constructionSiteService.getAll
  });

  const resellers = resellersData?.items || [];
  const sites = sitesData || [];

  const center: [number, number] = [3.8480, 11.5021]; // Yaounde, Cameroon default center

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header Over Map */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl px-5 py-3 border border-white flex items-center gap-3 pointer-events-auto">
          <div className="bg-orange-600 text-white p-2 rounded-xl">
            <MapIcon size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-none">Cartographie Live</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">SOREPCO Hub Géo</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-1.5 border border-white flex gap-1 pointer-events-auto">
          <ViewButton 
            active={view === 'ALL'} 
            onClick={() => setView('ALL')} 
            icon={<Layers size={16} />} 
            label="Tout" 
          />
          <ViewButton 
            active={view === 'RESELLERS'} 
            onClick={() => setView('RESELLERS')} 
            icon={<Users size={16} />} 
            label="Revendeurs" 
          />
          <ViewButton 
            active={view === 'SITES'} 
            onClick={() => setView('SITES')} 
            icon={<HardHat size={16} />} 
            label="Chantiers" 
          />
        </div>
      </div>

      {/* Map Control - My Location */}
      <button className="absolute bottom-6 right-6 z-[1000] bg-white text-gray-700 p-4 rounded-full shadow-2xl border border-gray-100 hover:text-orange-600 transition-all active:scale-95">
        <Crosshair size={24} />
      </button>

      {/* Map Content */}
      <div className="flex-1 z-0">
        <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {(view === 'ALL' || view === 'RESELLERS') && resellers.filter((r: any) => r.latitude && r.longitude).map((reseller: any) => (
            <Marker key={reseller.id} position={[reseller.latitude, reseller.longitude]} icon={resellerIcon}>
              <Popup>
                <div className="p-1">
                  <div className="text-[10px] font-black text-orange-600 uppercase mb-1">Revendeur</div>
                  <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">{reseller.businessName}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Code:</strong> {reseller.resellerCode}</p>
                    <p><strong>Niveau:</strong> {reseller.resellerLevel?.name}</p>
                    <p><strong>Ville:</strong> {reseller.city?.name}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {(view === 'ALL' || view === 'SITES') && sites.filter((site: any) => site.latitude && site.longitude).map((site: any) => (
            <Marker key={site.id} position={[site.latitude, site.longitude]} icon={siteIcon}>
              <Popup>
                <div className="p-1">
                  <div className="text-[10px] font-black text-blue-600 uppercase mb-1">Chantier BTP</div>
                  <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">{site.name}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Status:</strong> {site.status?.name}</p>
                    <p><strong>Étape:</strong> {site.stage?.name}</p>
                    <p><strong>Ville:</strong> {site.city?.name}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${active ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:bg-gray-50'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
