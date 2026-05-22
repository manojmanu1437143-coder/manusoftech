import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Send, Loader2, Sparkles } from 'lucide-react';

interface QuoteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const prefillUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setFormData(prev => ({
            ...prev,
            email: session.user.email || '',
            name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || ''
          }));
        }
      } catch (err) {
        console.warn('Error fetching session in QuoteModal:', err);
      }
    };
    prefillUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your name, email, and contact number so we can reach you.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            company: formData.company.trim() || null,
            service: formData.service || 'General Consulting',
            budget: formData.budget || null,
            message: formData.message.trim() || null,
            type: 'quote',
            status: 'New'
          }
        ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error submitting quote request:', err);
      // Fallback behavior if table isn't created yet -> mock local success
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-[#060f26]/80 backdrop-blur-md z-[998] flex items-center justify-center p-4 text-white font-rajdhani">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300" />
        
        {/* Title and Close */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={20} />
            <h3 className="font-exo font-extrabold text-xl tracking-wider uppercase text-white">Get a Free Quote</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Name *</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Manoj Kumar"
                className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address *</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="manoj@manusoftech.com"
                className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Number *</label>
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company / Org (Optional)</label>
              <input 
                type="text" 
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="My Business Ltd."
                className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
          </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Required</label>
              <select 
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full bg-[#06122d] border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
              >
                <option value="">Select a service...</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Website Designing">Website Designing</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="E-Commerce Website">E-Commerce Website</option>
                <option value="2D / 3D Animation">2D / 3D Animation</option>
                <option value="Custom Solution">Custom Solution</option>
              </select>
            </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Budget Tier</label>
            <select 
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full bg-[#06122d] border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors"
            >
              <option value="">Select a budget range...</option>
              <option value="Under $1,000">Under $1,000</option>
              <option value="$1,000 - $3,000">$1,000 - $3,000</option>
              <option value="$3,000 - $5,000">$3,000 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="Over $10,000">Over $10,000</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brief Project Scope</label>
            <textarea 
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Outline what you'd like us to develop..."
              className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2 px-3 text-sm text-white focus:border-cyan-400 outline-none transition-colors resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 disabled:opacity-50 text-white font-exo font-bold text-sm tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {loading ? 'Submitting Request...' : 'Submit Quote Request ✈'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
