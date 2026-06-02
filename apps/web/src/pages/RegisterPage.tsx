import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react';
import { authService } from '../services/apiServices';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      
      // Success - redirect to login
      navigate('/login', { state: { message: 'Compte créé avec succès. Veuillez vous connecter.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8 relative">
          <Link to="/login" className="absolute left-0 top-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-600/20">
            <HardHat size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Créer un Compte</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Rejoignez le réseau HUB</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wide border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Prénom</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                  placeholder="Jean" 
                />
                <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nom</label>
              <input 
                type="text" 
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                placeholder="Dupont" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Identifiant</label>
            <div className="relative">
              <input 
                type="text" 
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                placeholder="nom.utilisateur" 
              />
              <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email (Optionnel)</label>
            <div className="relative">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                placeholder="jean@exemple.com" 
              />
              <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Téléphone</label>
            <div className="relative">
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                placeholder="+237 6xx xxx xxx" 
              />
              <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Mot de passe</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                  placeholder="••••••••" 
                />
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Confirmer</label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-600/20 text-sm font-black uppercase tracking-widest hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Création en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-xs font-bold uppercase tracking-wide">
          Déjà un compte ? {' '}
          <Link to="/login" className="text-orange-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
