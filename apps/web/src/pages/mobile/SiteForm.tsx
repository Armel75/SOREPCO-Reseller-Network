import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { constructionSiteService, geoService, metadataService } from '@/services/api';
import { 
  X, 
  MapPin, 
  ArrowRight, 
  HardHat, 
  Building, 
  User, 
  Phone,
  MessageSquare,
  Loader2,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { gpsService } from '@/services/gpsService';
import { offlineService, SyncActionType } from '@/services/offlineService';

interface SiteFormProps {
  onBack: () => void;
}

export default function SiteForm({ onBack }: SiteFormProps) {
  const queryClient = useQueryClient();
  const [step] = useState(1);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contractor: '',
    phoneNumber: '',
    regionId: '',
    cityId: '',
    fullAddress: '',
    typeId: '',
    stageId: '',
    statusId: '',
    notes: ''
  });

  const { data: geoData } = useQuery({ queryKey: ['geo-data'], queryFn: geoService.getRegions });
  const { data: btpMetadata } = useQuery({ queryKey: ['btp-metadata'], queryFn: metadataService.getBTPlMetadata });

  useEffect(() => {
    gpsService.getCurrentPosition().then(loc => {
      setLocation({ latitude: loc.latitude, longitude: loc.longitude });
    }).catch(err => console.error("GPS missing", err));
  }, []);

  const mutation = useMutation({
    mutationFn: (data: any) => constructionSiteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['construction-sites'] });
      onBack();
    },
    onError: async (error) => {
      // Enterprise Offline-First
      await offlineService.queueAction(SyncActionType.CREATE_SITE, {
        ...formData,
        latitude: location?.latitude,
        longitude: location?.longitude
      });
      onBack();
    }
  });

  const handleSubmit = () => {
    mutation.mutate({
      ...formData,
      latitude: location?.latitude,
      longitude: location?.longitude
    });
  };

  const regions = geoData || [];
  const cities = regions.find((r: any) => r.id === formData.regionId)?.cities || [];

  return (
    <div className="flex flex-col h-screen bg-white text-brand-primary font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-orange-600 text-white">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <HardHat size={22} />
           </div>
           <div>
              <h2 className="text-lg font-black leading-none">Collecte BTP</h2>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Nouveau Chantier</p>
           </div>
        </div>
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full">
           <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* GPS Banner */}
        <div className="p-4 bg-orange-50 border border-orange-100 rounded-[24px] flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={`h-10 w-10 rounded-full flex items-center justify-center ${location ? 'bg-green-500 text-white' : 'bg-orange-200 text-orange-700 animate-pulse'}`}>
                  <MapPin size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase text-orange-700/50">Positionnement</div>
                  <div className="text-xs font-bold text-orange-900">
                     {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Recherche GPS...'}
                  </div>
               </div>
            </div>
            {location && <CheckCircle2 size={18} className="text-green-500" />}
        </div>

        {/* Section 1: Chantier */}
        <div className="space-y-5">
           <FormInput 
             label="Nom du chantier" 
             icon={<Building size={16} />} 
             placeholder="Propriété de M. X, Immeuble Y..." 
             value={formData.name}
             onChange={v => setFormData({...formData, name: v})}
           />
           <FormInput 
             label="Propriétaire / Promoteur" 
             icon={<User size={16} />} 
             placeholder="Nom complet" 
             value={formData.contractor}
             onChange={v => setFormData({...formData, contractor: v})}
           />
           <FormInput 
             label="Contact Téléphonique" 
             icon={<Phone size={16} />} 
             placeholder="6 XX XX XX XX" 
             value={formData.phoneNumber}
             onChange={v => setFormData({...formData, phoneNumber: v})}
           />
        </div>

        {/* Section 2: Géo */}
        <div className="space-y-5 pt-4 border-t border-border-subtle/50">
           <div className="grid grid-cols-2 gap-4">
              <FormSelect 
                label="Région" 
                value={formData.regionId}
                onChange={v => setFormData({...formData, regionId: v, cityId: ''})}
                options={regions.map((r: any) => ({ label: r.name, value: r.id }))}
              />
              <FormSelect 
                label="Ville" 
                value={formData.cityId}
                onChange={v => setFormData({...formData, cityId: v})}
                options={cities.map((c: any) => ({ label: c.name, value: c.id }))}
                disabled={!formData.regionId}
              />
           </div>
           <FormInput 
             label="Adresse / Localisation" 
             icon={<MapPin size={16} />}
             placeholder="Quartier, Repères..." 
             value={formData.fullAddress}
             onChange={v => setFormData({...formData, fullAddress: v})}
           />
        </div>

        {/* Section 3: BTP Details */}
        <div className="space-y-5 pt-4 border-t border-border-subtle/50">
           <FormSelect 
             label="Type d'Ouvrage" 
             value={formData.typeId}
             onChange={v => setFormData({...formData, typeId: v})}
             options={btpMetadata?.types.map((t: any) => ({ label: t.name, value: t.id })) || []}
           />
           <FormSelect 
             label="Étape d'Avancement" 
             value={formData.stageId}
             onChange={v => setFormData({...formData, stageId: v})}
             options={btpMetadata?.stages.map((s: any) => ({ label: s.name, value: s.id })) || []}
           />
           
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-brand-primary/30 flex items-center gap-2">
                 <MessageSquare size={14} /> Observations
              </label>
              <textarea 
                className="w-full bg-surface-bg border border-border-subtle rounded-2xl p-4 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-orange-600/20 h-24"
                placeholder="Besoins prévisibles, accès, concurrents..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
           </div>
        </div>

        {/* Photos */}
        <div className="pt-4 border-t border-border-subtle/50">
           <button className="flex w-full items-center justify-center gap-4 p-8 border-2 border-dashed border-border-subtle rounded-[32px] bg-surface-bg text-brand-primary/30 hover:border-orange-600 hover:text-orange-600 transition-all">
              <Camera size={28} />
              <div className="text-left">
                 <div className="text-sm font-black">Prendre une Photo</div>
                 <div className="text-[10px] font-bold opacity-60">Photo du panneau ou du chantier</div>
              </div>
           </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border-subtle bg-white">
        <button 
           onClick={handleSubmit}
           disabled={mutation.isPending || !formData.name || !formData.cityId}
           className="w-full h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 active:scale-95 transition-all text-sm font-black uppercase tracking-widest disabled:opacity-30"
        >
           {mutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
           Valider le Chantier
        </button>
      </div>
    </div>
  );
}

function FormInput({ label, icon, placeholder, value, onChange }: { label: string, icon: React.ReactNode, placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 flex items-center gap-2 ml-1">
         {icon} {label}
      </label>
      <input 
        type="text" 
        className="w-full bg-surface-bg border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold text-brand-primary placeholder:text-brand-primary/10 focus:bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all outline-none" 
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, disabled }: { label: string, value: string, onChange: (v: string) => void, options: { label: string, value: string }[], disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 ml-1">
         {label}
      </label>
      <select 
         className="w-full bg-surface-bg border border-border-subtle rounded-2xl px-5 py-4 text-sm font-bold text-brand-primary focus:bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all outline-none disabled:opacity-30 appearance-none bg-no-repeat bg-[right_1.25rem_center]"
         value={value}
         onChange={e => onChange(e.target.value)}
         disabled={disabled}
      >
         <option value="">Select...</option>
         {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
         ))}
      </select>
    </div>
  );
}
