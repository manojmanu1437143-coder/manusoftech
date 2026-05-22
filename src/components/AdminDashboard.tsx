import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ContactMessage } from '../types';
import { 
  Users, Mail, CheckCircle2, AlertCircle, Trash2, 
  RefreshCw, Copy, Check, Filter, Search, Code, ShieldAlert
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'quote'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const sqlSchema = `CREATE TABLE contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text,
  type text DEFAULT 'contact',
  status text DEFAULT 'New',
  company text,
  budget text
);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Allow anonymous updates" ON contact_messages FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous deletes" ON contact_messages FOR DELETE USING (true);`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Verification against owner custom administrator credential
    if (passcode === 'Manojmanu@143') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect passcode. Access is restricted to authorized administrators.');
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching Supabase data:', err);
      setErrorMsg(err.message || 'Unknown database retrieval error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state smoothly
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead submission?')) return;
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert('Error deleting submission: ' + err.message);
    }
  };

  const seedDemoData = async () => {
    try {
      setLoading(true);
      const demoLeads = [
        {
          name: 'Sarah Jenkins',
          email: 'sarah.j@creativeagency.com',
          phone: '+1 (555) 123-4567',
          service: 'UI/UX Design',
          message: 'Looking for an agency that can redesign our SaaS platform with a polished, highly-futuristic space theme.',
          type: 'quote',
          status: 'New',
          company: 'SaaSify Inc.',
          budget: '$5,000 - $10,000'
        },
        {
          name: 'Vikram Singh',
          email: 'vikram@fintechwave.in',
          phone: '+91 98765 43210',
          service: 'Mobile App Development',
          message: 'Need a fast Cross-Platform mobile app for transactional dashboard tracking. Must feature beautiful animations.',
          type: 'contact',
          status: 'In Progress'
        },
        {
          name: 'Emily Watson',
          email: 'emily@luxepack.com',
          phone: '+44 20 7946 0958',
          service: '2D / 3D Animation',
          message: 'We require a 3D product rendering and a 30-second smooth explainer video for our new organic cosmetics launch.',
          type: 'quote',
          status: 'Completed',
          company: 'LuxePack Beauty',
          budget: '$2,000 - $5,000'
        }
      ];

      const { error } = await supabase
        .from('contact_messages')
        .insert(demoLeads);

      if (error) throw error;
      fetchMessages();
    } catch (err: any) {
      alert('Failed to insert seed data: ' + err.message + '\n\nMake sure you have created the "contact_messages" table first using the SQL editor.');
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMessages = messages.filter(m => {
    const typeMatch = filterType === 'all' ? true : m.type === filterType;
    const statusMatch = filterStatus === 'all' ? true : m.status === filterStatus;
    const searchMatch = !searchQuery ? true : (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.message && m.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.company && m.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return typeMatch && statusMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060f26]/95 backdrop-blur-xl z-[999] overflow-y-auto px-4 py-8 md:px-8 font-rajdhani text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header section with brand and close */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b border-sky-400/20">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <h2 className="font-exo font-extrabold text-2xl tracking-wider text-white">
                MANUSOFtech <span className="text-cyan-400">CRM Lead Portal</span>
              </h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Secure administrative controller for database transactions & lead processing.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-exo font-bold text-sm tracking-widest uppercase transition-all"
          >
            Close Portal ✕
          </button>
        </div>

        {/* AUTHENTICATION OVERLAY */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto my-12 p-8 rounded-2xl glass-panel text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-exo font-bold text-xl mb-2 text-white">Admin Authentication Required</h3>
            <p className="text-gray-400 text-sm mb-6">
              Enter the password associated with MANUSOFtech to view active client databases.
            </p>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Secure Passcode</label>
                <input 
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-[#0d1b3e] border border-sky-400/35 rounded-lg py-3 px-4 text-white font-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  placeholder="Enter administrator passcode..."
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} /> {authError}
                </p>
              )}
              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-exo font-bold tracking-wider uppercase rounded-lg transition-transform focus:scale-95"
              >
                Access System Hub
              </button>
            </form>
            <div className="mt-6 pt-5 border-t border-sky-400/10 text-xs text-gray-500">
              Access restricted. Security authentication system is enforced.
            </div>
          </div>
        ) : (
          /* MAIN CRM DASHBOARD WINDOW */
          <div className="space-y-6">
            
            {/* Lead Stats Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-3 bg-cyan-400/10 text-cyan-400 rounded-lg"><Users size={24} /></div>
                <div>
                  <div className="text-xl font-bold font-exo">{messages.length}</div>
                  <div className="text-xs text-gray-400">Total Inquiries</div>
                </div>
              </div>
              <div className="p-5 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg"><AlertCircle size={24} /></div>
                <div>
                  <div className="text-xl font-bold font-exo">{messages.filter(m => m.status === 'New').length}</div>
                  <div className="text-xs text-gray-400">New Leads</div>
                </div>
              </div>
              <div className="p-5 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><RefreshCw size={24} /></div>
                <div>
                  <div className="text-xl font-bold font-exo">{messages.filter(m => m.status === 'In Progress').length}</div>
                  <div className="text-xs text-gray-400">In Progress</div>
                </div>
              </div>
              <div className="p-5 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 size={24} /></div>
                <div>
                  <div className="text-xl font-bold font-exo">{messages.filter(m => m.status === 'Completed').length}</div>
                  <div className="text-xs text-gray-400">Completed Projects</div>
                </div>
              </div>
            </div>

            {/* Filter and search controllers */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch bg-white/5 p-4 rounded-xl border border-sky-400/15">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <span className="absolute left-3 top-2.5 text-gray-500"><Search size={16} /></span>
                  <input 
                    type="text" 
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#060f26] border border-sky-400/25 rounded-md text-sm text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                {/* Filter Type */}
                <div className="flex items-center gap-1 bg-[#060f26] border border-sky-400/25 p-1 rounded-md text-xs">
                  <span className="px-2 text-gray-400"><Filter size={12} className="inline mr-1" /> Type:</span>
                  <button 
                    onClick={() => setFilterType('all')} 
                    className={`px-3 py-1 rounded-sm ${filterType === 'all' ? 'bg-cyan-400 text-[#060f26] font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterType('contact')} 
                    className={`px-3 py-1 rounded-sm ${filterType === 'contact' ? 'bg-cyan-400 text-[#060f26] font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Contact
                  </button>
                  <button 
                    onClick={() => setFilterType('quote')} 
                    className={`px-3 py-1 rounded-sm ${filterType === 'quote' ? 'bg-cyan-400 text-[#060f26] font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Quote
                  </button>
                </div>

                {/* Filter Status */}
                <div className="flex items-center bg-[#060f26] border border-sky-400/25 p-1 rounded-md text-xs">
                  <span className="px-2 text-gray-400">Status:</span>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-white outline-none border-0 font-bold"
                  >
                    <option value="all" className="bg-[#0d1b3e]">All Statuses</option>
                    <option value="New" className="bg-[#0d1b3e]">New</option>
                    <option value="In Progress" className="bg-[#0d1b3e]">In Progress</option>
                    <option value="Contacted" className="bg-[#0d1b3e]">Contacted</option>
                    <option value="Completed" className="bg-[#0d1b3e]">Completed</option>
                  </select>
                </div>
              </div>

              {/* Refresh & Seeder buttons */}
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={fetchMessages}
                  className="px-4 py-1.5 rounded-md bg-[#060f26] border border-sky-400/25 hover:border-cyan-400 text-sm flex items-center gap-2 text-sky-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Reload
                </button>
                <button 
                  onClick={seedDemoData}
                  className="px-4 py-1.5 rounded-md bg-blue-600/20 border border-blue-500/35 hover:bg-blue-600/40 text-sm text-cyan-400 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span>✨</span> Seed Mock Leads
                </button>
              </div>
            </div>

            {/* ERROR / TABLE SETUP SECTION */}
            {errorMsg && (
              <div className="p-6 rounded-xl bg-orange-600/10 border border-orange-500/35 shadow-lg relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-exo font-bold text-lg text-orange-400">Supabase Table Structure Verification Required</h4>
                      <p className="text-sm text-gray-300 mt-1">
                        We connected successfully to your Supabase project (ID: <span className="text-cyan-400 font-mono">rduirrzhdrgyxyvtrrox</span>), but the table '<span className="text-orange-400 font-mono">contact_messages</span>' does not appear to exist yet. This is expected for new databases.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Code size={12} /> SQL Setup Script
                        </span>
                        <button 
                          onClick={handleCopySql}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded flex items-center gap-1.5 text-xs text-gray-300 transition-colors"
                        >
                          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copied ? 'Copied' : 'Copy Script'}
                        </button>
                      </div>
                      <pre className="p-4 bg-[#030a1a] border border-sky-400/20 rounded-lg text-xs leading-relaxed font-mono text-cyan-300 overflow-x-auto max-h-48 select-all">
                        {sqlSchema}
                      </pre>
                    </div>

                    <div className="text-sm text-gray-300 space-y-1.5 bg-[#060f26] p-4 rounded-lg border border-sky-400/20">
                      <div className="font-bold text-white mb-1 flex items-center gap-1"><ShieldAlert size={14} className="text-orange-400" /> Setup Instructions:</div>
                      <div>1. Go to your <a href="https://supabase.com" target="_blank" rel="noopener" className="underline text-cyan-400 hover:text-white">Supabase Dashboard</a> and select the <strong>manusoftech</strong> project.</div>
                      <div>2. Click on the <strong>SQL Editor</strong> tab on the left navigation panel.</div>
                      <div>3. Paste the copied script above and click <strong>Run</strong> at the bottom right.</div>
                      <div>4. Once done, reload this dashboard using the button above and test!</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LEADS LIST TABLE */}
            {loading ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-sky-400/10">
                <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-4" size={36} />
                <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Querying Supabase Database...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-sky-400/10">
                <div className="text-5xl mb-4">📂</div>
                <p className="text-white font-exo font-bold text-lg">No Lead Submissions Found</p>
                <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                  Try submitting the contact form on home page or click "Seed Mock Leads" above to populate mock entries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-sky-400/15 bg-white/5">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-sky-400/20 bg-[#060f26]/60 text-cyan-400 font-exo font-bold uppercase tracking-wider text-xs">
                      <th className="p-4">Type</th>
                      <th className="p-4">Client Detail</th>
                      <th className="p-4">Services Requested</th>
                      <th className="p-4">Inquiry / Message</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-400/10">
                    {filteredMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 align-top">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest ${msg.type === 'quote' ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-[#060f26]' : 'bg-gray-700 text-gray-200'}`}>
                            {msg.type}
                          </span>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-bold text-white">{msg.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 select-all">
                            <Mail size={12} className="text-cyan-400" /> {msg.email}
                          </div>
                          {msg.phone && (
                            <div className="text-xs text-sky-400/80 flex items-center gap-1.5 mt-0.5 select-all">
                              <span>📞</span> {msg.phone}
                            </div>
                          )}
                          {msg.company && (
                            <div className="text-xs text-cyan-400/70 mt-1 font-bold">🏢 {msg.company}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(msg.created_at).toLocaleDateString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-bold text-white">{msg.service || 'General Consulting'}</div>
                          {msg.budget && (
                            <div className="text-xs text-emerald-400 font-bold mt-1 font-mono">Bgt: {msg.budget}</div>
                          )}
                        </td>
                        <td className="p-4 align-top max-w-sm">
                          <p className="text-gray-300 leading-relaxed text-xs max-h-24 overflow-y-auto pr-1 select-text">
                            {msg.message || 'No additional project scope provided.'}
                          </p>
                        </td>
                        <td className="p-4 align-top">
                          <select 
                            value={msg.status}
                            onChange={(e) => updateStatus(msg.id, e.target.value)}
                            className={`px-2 py-1 rounded border text-xs font-bold font-exo outline-none cursor-pointer ${getStatusColor(msg.status)}`}
                          >
                            <option value="New" className="bg-[#0d1b3e] text-yellow-400">New</option>
                            <option value="In Progress" className="bg-[#0d1b3e] text-blue-400">In Progress</option>
                            <option value="Contacted" className="bg-[#0d1b3e] text-purple-400">Contacted</option>
                            <option value="Completed" className="bg-[#0d1b3e] text-emerald-400">Completed</option>
                          </select>
                        </td>
                        <td className="p-4 align-top text-center">
                          <button 
                            onClick={() => deleteMessage(msg.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-md transition-all inline-flex items-center justify-center align-middle"
                            title="Delete Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
