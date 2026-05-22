import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ContactMessage } from '../types';
import { Mail, RefreshCw, Sparkles, Filter, Inbox, ChevronRight, User, Terminal, Calendar, Layers, ShieldCheck } from 'lucide-react';

interface ClientDashboardProps {
  userEmail: string;
  userDisplayName?: string;
  onClose: () => void;
  onSignOut: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  userEmail, 
  userDisplayName, 
  onClose, 
  onSignOut 
}) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'quote'>('all');

  const fetchClientMessages = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (err: any) {
      console.warn('Error fetching client inquiries from Supabase:', err);
      setErrorMsg(err.message || 'Unable to load client table from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientMessages();
  }, [userEmail]);

  const filteredMessages = messages.filter(m => {
    return filterType === 'all' ? true : m.type === filterType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': 
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'In Progress': 
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse';
      case 'Contacted': 
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Completed': 
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: 
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060f26]/95 backdrop-blur-xl z-[998] overflow-y-auto px-4 py-8 md:px-8 font-rajdhani text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Dynamic header row matching the style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b border-sky-400/20">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🌌</span>
              <h2 className="font-exo font-extrabold text-2xl tracking-wider text-white">
                Client <span className="text-cyan-400">Inquiry Workspace</span>
              </h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" /> Fully Encrypted Workspace Session
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onSignOut}
              className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-exo font-bold text-xs tracking-wider uppercase transition-all"
            >
              Sign Out ✈
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/5 border border-sky-400/25 hover:border-cyan-400 text-sky-300 hover:text-white font-exo font-bold text-xs tracking-wider uppercase transition-all"
            >
              Back to Home ✕
            </button>
          </div>
        </div>

        {/* User profile details banner */}
        <div className="bg-[#0d1b3e]/60 border border-sky-400/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-exo font-extrabold text-white text-xl">
              {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : <User size={24} />}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest font-mono">Welcome Back</div>
              <h3 className="text-xl font-exo font-extrabold text-white">{userDisplayName || 'User Client'}</h3>
              <div className="text-xs text-cyan-400/80 font-semibold flex items-center gap-1.5 mt-0.5">
                <Mail size={12} /> {userEmail}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-xl bg-white/5 border border-sky-400/10 text-center flex-1">
              <div className="text-xl font-bold font-exo text-cyan-400">{messages.length}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Orders</div>
            </div>
            <div className="px-5 py-3 rounded-xl bg-white/5 border border-sky-400/10 text-center flex-1">
              <div className="text-xl font-bold font-exo text-yellow-400">{messages.filter(m => m.status === 'New').length}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Awaiting Review</div>
            </div>
          </div>
        </div>

        {/* Filters and Controls block */}
        <div className="flex justify-between items-center bg-white/5 border border-sky-400/10 p-4 rounded-xl mb-6">
          <div className="flex items-center bg-[#060f26] border border-sky-400/20 p-1 rounded-lg text-xs">
            <span className="px-2 text-gray-400 flex items-center gap-1"><Filter size={12} /> Filter:</span>
            <button 
              onClick={() => setFilterType('all')} 
              className={`px-3 py-1 rounded-md transition-colors ${filterType === 'all' ? 'bg-cyan-400 text-[#060f26] font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              All Requests
            </button>
            <button 
              onClick={() => setFilterType('quote')} 
              className={`px-3 py-1 rounded-md transition-colors ${filterType === 'quote' ? 'bg-cyan-400 text-[#060f26] font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Quotes
            </button>
            <button 
              onClick={() => setFilterType('contact')} 
              className={`px-3 py-1 rounded-md transition-colors ${filterType === 'contact' ? 'bg-cyan-400 text-[#060f26] font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Messages
            </button>
          </div>

          <button 
            onClick={fetchClientMessages}
            className="px-4 py-1.5 rounded-lg bg-[#060f26] border border-sky-400/20 hover:border-cyan-400 text-xs flex items-center gap-2 text-sky-400 hover:text-white transition-colors uppercase tracking-wider font-bold"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-sky-400/10">
            <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-4" size={32} />
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Querying Client Database...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-4">
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button 
              onClick={fetchClientMessages}
              className="px-6 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold uppercase"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-sky-400/10">
            <div className="text-5xl mb-4"><Inbox className="mx-auto text-gray-500" size={48} /></div>
            <p className="text-white font-exo font-bold text-lg">No Submissions Logged Yet</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
              You haven't requested any custom solutions or quote blueprints yet. Use the homepage forms or click the 'Get Quote' button in the top right!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="rounded-2xl border border-sky-400/15 bg-white/5 hover:border-cyan-400/40 p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-lg relative overflow-hidden"
              >
                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/5 to-transparent pointer-events-none" />

                {/* Card Header information */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      msg.type === 'quote' 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-[#060f26]' 
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      {msg.type} Reference
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-exo ${getStatusBadge(msg.status)}`}>
                      {msg.status}
                    </span>
                  </div>

                  <h4 className="font-exo font-extrabold text-lg text-white">
                    {msg.service || 'General Consulting Blueprint'}
                  </h4>

                  {msg.company && (
                    <div className="text-xs text-cyan-400/90 font-semibold">🏢 Organization: {msg.company}</div>
                  )}

                  {msg.phone && (
                    <div className="text-xs text-sky-300 font-semibold">📞 Phone/Contact: {msg.phone}</div>
                  )}

                  {msg.budget && (
                    <div className="text-xs text-emerald-400 font-bold font-mono">💵 Budget Tier: {msg.budget}</div>
                  )}

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> 
                    Submitted on {new Date(msg.created_at).toLocaleDateString(undefined, { 
                      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Card Body Inquiry message text */}
                <div className="pt-3 border-t border-sky-400/10 space-y-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Your Project Brief:</div>
                  <pre className="p-3 bg-black/30 rounded-lg text-xs leading-relaxed font-sans text-gray-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {msg.message || 'No additional project requirements provided.'}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-xs text-gray-500 font-medium">
          Need immediate consultation? Contact us anytime at{' '}
          <a href="mailto:manusoftech0@gmail.com" className="text-cyan-400 hover:underline">
            manusoftech0@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};
