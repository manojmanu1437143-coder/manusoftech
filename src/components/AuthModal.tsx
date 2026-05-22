import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, User, Sparkles, Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (userEmail: string, displayName?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = email.trim();
    const nameTrimmed = fullName.trim();
    
    if (!emailTrimmed) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!nameTrimmed) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        // Perform Supabase SignUp
        const { data, error } = await supabase.auth.signUp({
          email: emailTrimmed,
          password: password,
          options: {
            data: {
              display_name: nameTrimmed,
              full_name: nameTrimmed
            }
          }
        });

        if (error) throw error;

        // check if user is already session-authenticated (auto-login) or if they need to verify email
        if (data?.session) {
          onSuccess(emailTrimmed, nameTrimmed);
          onClose();
        } else {
          setSuccessMsg('Account created successfully! Please check your email inbox to confirm your registration.');
          // Clear inputs
          setEmail('');
          setPassword('');
          setFullName('');
        }
      } else {
        // Perform Supabase SignIn
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailTrimmed,
          password: password,
        });

        if (error) throw error;

        if (data?.user) {
          const fetchedDisplayName = data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || emailTrimmed.split('@')[0];
          onSuccess(emailTrimmed, fetchedDisplayName);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060f26]/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 text-white font-rajdhani">
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 md:p-8 shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300" />
        
        {/* Header containing brand and close */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-400 animate-pulse" size={20} />
            <h3 className="font-exo font-extrabold text-lg tracking-wider uppercase text-white">
              {activeTab === 'signin' ? 'Sign In to Portal' : 'Create User Account'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#06122d] border border-sky-400/20 p-1.5 rounded-lg mb-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-md font-exo transition-all ${
              activeTab === 'signin' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-md font-exo transition-all ${
              activeTab === 'signup' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Success message pane if registration needs email confirmation */}
        {successMsg ? (
          <div className="space-y-4 text-center py-6">
            <div className="flex justify-center text-emerald-400">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
            <h4 className="font-exo font-bold text-lg text-emerald-400">Confirmation Sent</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              We've dispatched a secure verification link to your email. Click it to activate your account.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessMsg(null);
                  setActiveTab('signin');
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-sky-300 hover:text-white transition-all font-semibold font-exo"
              >
                Proceed to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Forms */
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {activeTab === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={12} className="text-cyan-400" /> Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Manoj Kumar"
                  className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} className="text-cyan-400" /> Email Address *
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manoj@example.com"
                className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={12} className="text-cyan-400" /> Password *
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold leading-relaxed mt-1">
                ⚠️ {errorMsg}
              </p>
            )}

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 disabled:opacity-50 text-white font-exo font-bold text-sm tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,212,255,0.15)]"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                {loading 
                  ? 'Authenticating...' 
                  : activeTab === 'signin' 
                    ? 'Access Portal ✈' 
                    : 'Register Account ✈'
                }
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-sky-400/10 text-center text-xs text-gray-500 font-medium">
          Secure systems encryption technology is used to protect your credentials.
        </div>
      </div>
    </div>
  );
};
