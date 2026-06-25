import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User as UserIcon, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [skillsOfferedInput, setSkillsOfferedInput] = useState('');
  const [skillsWantedInput, setSkillsWantedInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const { register, error, loading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name || !email || !password) {
      setValidationError('Please fill in all core fields.');
      return;
    }

    // Split skills by comma and trim whitespaces
    const skillsOffered = skillsOfferedInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const skillsWanted = skillsWantedInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      await register({
        name,
        email,
        password,
        role,
        skillsOffered,
        skillsWanted
      });
      navigate('/');
    } catch (err) {
      // Handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070B14] relative px-4 py-8 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-6 md:p-8 shadow-glass space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-white flex items-center justify-center gap-2">
            <Sparkles className="text-indigo-400 animate-pulse" size={24} />
            <span>Join SkillSwap</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">Create your peer learning account</p>
        </div>

        {(error || validationError) && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            <AlertCircle size={18} />
            <span>{error || validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder="john@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Primary Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-800 focus:border-indigo-500 text-slate-200 px-4 py-2.5 rounded-xl text-sm transition"
              >
                <option value="Student">Student (Focuses on learning)</option>
                <option value="Mentor">Mentor (Focuses on coaching)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Skills You Offer (Comma-separated)</label>
            <input 
              type="text" 
              placeholder="e.g. Node.js, JavaScript, Python"
              value={skillsOfferedInput}
              onChange={(e) => setSkillsOfferedInput(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
            />
            <p className="text-[10px] text-slate-500">Skills you are confident to teach other peers</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Skills You Want (Comma-separated)</label>
            <input 
              type="text" 
              placeholder="e.g. React, Tailwind CSS, Docker"
              value={skillsWantedInput}
              onChange={(e) => setSkillsWantedInput(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
            />
            <p className="text-[10px] text-slate-500">Skills you want to learn or master</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl text-sm font-semibold shadow-glass-glow transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
