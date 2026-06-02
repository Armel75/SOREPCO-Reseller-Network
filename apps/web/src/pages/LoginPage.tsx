import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { HardHat, User, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/apiServices';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState((location.state as any)?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await authService.login(formData);
      localStorage.setItem('sorepco_token', data.token);
      localStorage.setItem('sorepco_user', JSON.stringify(data.user));
      window.location.href = '/'; 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides');
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
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-600/20">
            <HardHat size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">SOREPCO Hub</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Accès Enterprise</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-xs font-bold uppercase tracking-wide border border-green-100">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wide border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Utilisateur</label>
            <div className="relative">
              <input 
                type="text" 
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all" 
                placeholder="votre.nom" 
              />
              <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>
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
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-600/20 text-sm font-black uppercase tracking-widest hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 text-xs font-bold uppercase tracking-wide">
          Pas de compte ? {' '}
          <Link to="/register" className="text-orange-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
