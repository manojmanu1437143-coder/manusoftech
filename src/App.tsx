import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { servicesData, portfolioData, processData } from './data';
import { Logo } from './components/Logo';
import { ParticleCanvas } from './components/ParticleCanvas';
import { ServiceCard } from './components/ServiceCard';
import { QuoteModal } from './components/QuoteModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ClientDashboard } from './components/ClientDashboard';
import { 
  Briefcase, Mail, Cpu, ExternalLink, Menu, X, 
  Sparkles, CheckCircle2, ChevronRight, Lock 
} from 'lucide-react';

export default function App() {
  // Mobile nav state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Device detection state for tablet and touch recognition
  const [deviceInfo, setDeviceInfo] = useState({
    isTouch: false,
    isTablet: false,
    deviceName: 'Desktop Console'
  });
  
  // Modal states
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [clientDashboardOpen, setClientDashboardOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; displayName?: string } | null>(null);
  
  // Custom cursor position state (hidden on mobile, responsive on desktop)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Form states and submission feedback
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactService, setContactService] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Project Counter Stats
  const [projectsCount, setProjectsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);

  // Sync session and auth status
  useEffect(() => {
    const syncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser({
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
          });
        }
      } catch (err) {
        console.warn('Error fetching active session:', err);
      }
    };
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser({
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Dynamic Tablet & Touch recognition system
  useEffect(() => {
    const detectDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const width = window.innerWidth;
      
      // Recognize tablets by viewport widths and user agent identifiers
      const isTabletScreen = width >= 600 && width <= 1024;
      const ua = navigator.userAgent.toLowerCase();
      const isTabletUA = /ipad|tablet|playbook|silk/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /macintosh/i.test(ua));
      
      const isTablet = isTabletScreen || isTabletUA;
      
      let deviceName = 'Desktop Console';
      if (isTablet) {
        deviceName = 'Touch Tablet Panel';
      } else if (hasTouch && width < 600) {
        deviceName = 'Mobile Device';
      }

      setDeviceInfo({
        isTouch: hasTouch,
        isTablet: isTablet,
        deviceName: deviceName
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Auto pre-fill homepage inquiry form on state match
  useEffect(() => {
    if (currentUser) {
      setContactName(currentUser.displayName || '');
      setContactEmail(currentUser.email || '');
    } else {
      setContactName('');
      setContactEmail('');
    }
  }, [currentUser]);

  // Mouse move tracker for cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth lagging ring cursor effect
  useEffect(() => {
    let animId: number;
    const animateRing = () => {
      setRingPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.15,
        y: prev.y + (mousePos.y - prev.y) * 0.15
      }));
      animId = requestAnimationFrame(animateRing);
    };
    animId = requestAnimationFrame(animateRing);
    return () => cancelAnimationFrame(animId);
  }, [mousePos]);

  // Statistics Counting Effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 30; // 30ms step
    const steps = duration / interval;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProjectsCount(Math.min(Math.floor((50 / steps) * step), 50));
      setClientsCount(Math.min(Math.floor((30 / steps) * step), 30));
      setServicesCount(Math.min(Math.floor((6 / steps) * step), 6));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      alert('Please fill in your Name, Email, and Contact Number.');
      return;
    }

    setIsSubmitting(true);

    const contactData = {
      name: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      service: contactService || 'General Inquiry',
      message: contactMessage.trim() || null,
      type: 'contact',
      status: 'New'
    };

    try {
      // Connect and save into Supabase contact_messages table
      const { error } = await supabase
        .from('contact_messages')
        .insert([contactData]);

      if (error) {
        throw error;
      }

      setToastMessage('✅ Your message is logged! We will get back to you soon.');
    } catch (err: any) {
      console.warn('Supabase DB insert failed (likely table setup is missing). Logging to mock success:', err);
      
      // Real-time offline fallback backup
      const localMsg = {
        ...contactData,
        id: 'local_' + Date.now(),
        created_at: new Date().toISOString()
      };
      
      try {
        const existing = localStorage.getItem('local_contact_messages');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(localMsg);
        localStorage.setItem('local_contact_messages', JSON.stringify(list));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      setToastMessage('✨ Message stored in Local Demo Mode! Open the Database Portal below to see inquiries.');
    } finally {
      setIsSubmitting(false);
      setShowToast(true);
      // Clear inputs
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactService('');
      setContactMessage('');
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleGetQuoteClick = () => {
    if (!currentUser) {
      setToastMessage('🔑 Please Sign In or Create an Account first to request a quote!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      setAuthModalOpen(true);
    } else {
      setQuoteModalOpen(true);
    }
  };

  const handleInteractiveHover = (hovering: boolean) => {
    setIsHovered(hovering);
  };

  return (
    <div className="relative text-white font-rajdhani bg-[#0d1b3e] min-h-screen">
      
      {/* Premium custom mouse follow cursors (only on non-touch screens with client pointer) */}
      {!deviceInfo.isTouch && !deviceInfo.isTablet && (
        <>
          <div 
            className="hidden md:block fixed w-3 h-3 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-screen -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
            style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
          />
          <div 
            className="hidden md:block fixed rounded-full border border-sky-400 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ 
              left: `${ringPos.x}px`, 
              top: `${ringPos.y}px`, 
              width: isHovered ? '56px' : '36px', 
              height: isHovered ? '56px' : '36px' 
            }}
          />
        </>
      )}

      {/* Cybernetic Particle Background canvas */}
      <ParticleCanvas />

      {/* GLASSMORPHIC HEADER / NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#0d1b3e]/85 backdrop-blur-xl border-b border-sky-400/20 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Logo className="w-11 h-11" />
          <div className="relative pr-2">
            <div className="font-exo font-extrabold text-xl md:text-2xl tracking-wider leading-none">
              MANUSOF<span className="text-cyan-400">tech</span>
            </div>
            {/* Dynamic Tablet & Touch Recognition Badge */}
            <div className="absolute -bottom-5 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded border border-cyan-400/25 bg-[#0d1b3e]/90 text-[8px] font-bold text-cyan-300 uppercase tracking-widest leading-none select-none whitespace-nowrap">
              <span className={`w-1.5 h-1.5 rounded-full ${deviceInfo.isTablet ? 'bg-cyan-400 animate-pulse' : deviceInfo.isTouch ? 'bg-orange-400' : 'bg-green-400'} inline-block`} />
              <span>{deviceInfo.deviceName} Mode</span>
            </div>
          </div>
        </div>

        {/* Desktop navbar list */}
        <ul className="hidden md:flex items-center gap-8 font-exo font-bold text-sm tracking-widest uppercase text-white/80">
          <li><a href="#hero" onMouseEnter={() => handleInteractiveHover(true)} onMouseLeave={() => handleInteractiveHover(false)} className="hover:text-cyan-400 transition-colors">Home</a></li>
          <li><a href="#services" onMouseEnter={() => handleInteractiveHover(true)} onMouseLeave={() => handleInteractiveHover(false)} className="hover:text-cyan-400 transition-colors">Services</a></li>
          <li><a href="#about" onMouseEnter={() => handleInteractiveHover(true)} onMouseLeave={() => handleInteractiveHover(false)} className="hover:text-cyan-400 transition-colors">About</a></li>
          <li><a href="#portfolio" onMouseEnter={() => handleInteractiveHover(true)} onMouseLeave={() => handleInteractiveHover(false)} className="hover:text-cyan-400 transition-colors">Portfolio</a></li>
          <li><a href="#process" onMouseEnter={() => handleInteractiveHover(true)} onMouseLeave={() => handleInteractiveHover(false)} className="hover:text-cyan-400 transition-colors">Process</a></li>
          <li><a href="#contact" onMouseEnter={() => handleInteractiveHover(true)} onMouseLeave={() => handleInteractiveHover(false)} className="hover:text-cyan-400 transition-colors">Contact</a></li>
        </ul>

        {/* Action Button layout */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => setAdminOpen(true)}
            onMouseEnter={() => handleInteractiveHover(true)} 
            onMouseLeave={() => handleInteractiveHover(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-sky-400/25 hover:border-cyan-400 text-xs font-bold text-sky-300 hover:text-white transition-all uppercase tracking-wider"
          >
            <Lock size={12} /> CRM Admin
          </button>

          {currentUser ? (
            <>
              <button 
                onClick={() => setClientDashboardOpen(true)}
                onMouseEnter={() => handleInteractiveHover(true)} 
                onMouseLeave={() => handleInteractiveHover(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-400/10 border border-cyan-400/30 hover:border-cyan-400 text-xs font-bold text-cyan-300 hover:text-white transition-all uppercase tracking-wider font-exo"
              >
                🌌 My Workspace
              </button>
              <button 
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    setToastMessage('👋 Successfully signed out!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 4500);
                  } catch (err: any) {
                    console.error('Sign-out error:', err);
                  }
                }}
                onMouseEnter={() => handleInteractiveHover(true)} 
                onMouseLeave={() => handleInteractiveHover(false)}
                className="px-3 py-1.5 rounded text-xs font-bold font-exo text-red-400 hover:text-white hover:bg-red-500/10 border border-red-500/20 transition-all uppercase tracking-wider"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="px-4 py-1.5 rounded bg-[#06122d] border border-sky-400/30 hover:border-cyan-400 text-xs font-bold text-white hover:text-cyan-400 transition-all uppercase tracking-wider font-exo"
            >
              Sign In / Sign Up
            </button>
          )}

          <button 
            onClick={handleGetQuoteClick}
            onMouseEnter={() => handleInteractiveHover(true)} 
            onMouseLeave={() => handleInteractiveHover(false)}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 font-exo font-bold text-xs tracking-widest uppercase duration-300 shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_30px_rgba(0,212,255,0.45)] hover:-translate-y-0.5 transition-all text-white"
          >
            Get Quote
          </button>
        </div>

        {/* Mobile Hamburger menu */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-cyan-400"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[70px] bg-[#0d1b3e]/97 backdrop-blur-2xl z-40 flex flex-col p-8 border-b border-sky-400/20 md:hidden animate-fadeIn">
          <ul className="flex flex-col gap-6 font-exo font-bold text-lg tracking-wider uppercase text-white/90">
            <li><a href="#hero" onClick={() => setMobileMenuOpen(false)} className="hover:text-cyan-400 block py-1">Home</a></li>
            <li><a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-cyan-400 block py-1">Services</a></li>
            <li><a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-cyan-400 block py-1">About</a></li>
            <li><a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="hover:text-cyan-400 block py-1">Portfolio</a></li>
            <li><a href="#process" onClick={() => setMobileMenuOpen(false)} className="hover:text-cyan-400 block py-1">Process</a></li>
            <li><a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-cyan-400 block py-1">Contact</a></li>
          </ul>
          <div className="mt-auto space-y-3">
            {currentUser ? (
              <>
                <button 
                  onClick={() => { setClientDashboardOpen(true); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-exo font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  🌌 My Workspace
                </button>
                <button 
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    try {
                      await supabase.auth.signOut();
                      setToastMessage('👋 Successfully signed out!');
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 4500);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="w-full py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-exo font-bold text-sm tracking-widest uppercase"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-lg bg-[#06122d] border border-sky-400/30 text-white font-exo font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              >
                Sign In / Sign Up 🔑
              </button>
            )}

            <button 
              onClick={() => { setAdminOpen(true); setMobileMenuOpen(false); }}
              className="w-full py-3 rounded-lg bg-white/5 border border-sky-400/20 text-sky-300 font-exo font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <Lock size={14} /> CRM Admin Portal
            </button>
            <button 
              onClick={() => { handleGetQuoteClick(); setMobileMenuOpen(false); }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-exo font-extrabold text-sm tracking-widest uppercase rounded-lg"
            >
              Get Free Quote
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center text-center px-4 md:px-8 pt-24 overflow-hidden">
        
        {/* Glow halo effects */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border border-cyan-400/10 pointer-events-none" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] md:w-[900px] md:h-[900px] rounded-full border border-blue-400/5 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-cyan-400/35 rounded-full bg-cyan-400/5 text-cyan-400 font-exo text-xs font-bold uppercase tracking-widest animate-pulse">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            Leading Digital Innovation
          </div>

          <h1 className="font-exo font-[900] text-3xl sm:text-5xl md:text-7xl leading-tight tracking-tight text-white">
            We Build <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(0,212,255,0.25)]">Digital Solutions</span><br />That Scale
          </h1>

          <p className="text-gray-400 font-medium text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
            MANUSOFtech is an elite techno-creative agency specialized in UI/UX Layout, Responsive Web Engineering, Android/iOS Apps, and Immersive 3D Animation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a 
              href="#services"
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 font-exo font-bold text-sm tracking-widest uppercase transition-transform shadow-[0_4px_25px_rgba(0,212,255,0.25)] hover:shadow-[0_8px_35px_rgba(0,212,255,0.45)] text-white"
            >
              Explore Services
            </a>
            <button 
              onClick={handleGetQuoteClick}
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="px-8 py-3.5 rounded-lg border border-sky-400/25 bg-sky-200/5 text-sky-300 hover:bg-sky-200/15 hover:border-cyan-400 font-exo font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Get Quote
            </button>
          </div>
        </div>

        {/* Visual floating mini panels */}
        <div className="hidden lg:block absolute left-10 top-1/4 p-4 rounded-xl border border-sky-400/10 bg-white/5 backdrop-blur-md text-xs tracking-wider font-semibold shadow-xl hover:-translate-y-1 transition-transform">
          🎨 Beautiful UI UX Layouts
        </div>
        <div className="hidden lg:block absolute right-12 top-1/3 p-4 rounded-xl border border-sky-400/10 bg-white/5 backdrop-blur-md text-xs tracking-wider font-semibold shadow-xl hover:-translate-y-1 transition-transform">
          📱 Native iOS/Android Apps
        </div>
        <div className="hidden lg:block absolute left-14 bottom-1/4 p-4 rounded-xl border border-sky-400/10 bg-white/5 backdrop-blur-md text-xs tracking-wider font-semibold shadow-xl hover:-translate-y-1 transition-transform">
          💻 Next-Gen Web Stack
        </div>
        <div className="hidden lg:block absolute right-16 bottom-1/3 p-4 rounded-xl border border-sky-400/10 bg-white/5 backdrop-blur-md text-xs tracking-wider font-semibold shadow-xl hover:-translate-y-1 transition-transform">
          🎬 Immersive 2D & 3D Animation
        </div>
      </section>

      {/* CORE SERVICES SECTION */}
      <section id="services" className="relative px-6 md:px-12 py-24 bg-gradient-to-b from-[#0d1b3e] to-[#060f26]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Our Capabilities</div>
          <h2 className="font-exo font-extrabold text-3xl md:text-5xl text-white">
            We Deliver <span className="text-cyan-400">Excellence</span>
          </h2>
          <div className="w-12 h-1 bg-cyan-400 mx-auto rounded-full" />
          <p className="text-gray-400 font-medium text-[1.1rem]">
            High-performance engineering coupled with sleek visual design. Check out our core services below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {servicesData.map((svc) => (
            <ServiceCard 
              key={svc.id}
              icon={svc.icon}
              title={svc.title}
              description={svc.description}
            />
          ))}
        </div>
      </section>

      {/* ABOUT COMPANY & 3D ROTATING CUBE */}
      <section id="about" className="relative px-6 md:px-12 py-24 bg-[#060f26]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Decorative Cube Visual Scene */}
          <div className="flex justify-center items-center py-8">
            <div className="cube-scene w-56 h-56 relative">
              <div className="cube w-full h-full relative">
                <div className="absolute w-56 h-56 border border-cyan-400/40 bg-blue-600/10 flex items-center justify-center font-exo font-bold text-sm tracking-wider text-cyan-400/80 [transform:translateZ(112px)]">DESIGN</div>
                <div className="absolute w-56 h-56 border border-cyan-400/40 bg-blue-600/10 flex items-center justify-center font-exo font-bold text-sm tracking-wider text-cyan-400/80 [transform:rotateY(180deg)_translateZ(112px)]">DEVELOP</div>
                <div className="absolute w-56 h-56 border border-cyan-400/40 bg-blue-600/10 flex items-center justify-center font-exo font-bold text-sm tracking-wider text-cyan-400/80 [transform:rotateY(-90deg)_translateZ(112px)]">ANIMATE</div>
                <div className="absolute w-56 h-56 border border-cyan-400/40 bg-blue-600/10 flex items-center justify-center font-exo font-bold text-sm tracking-wider text-cyan-400/80 [transform:rotateY(90deg)_translateZ(112px)]">DEPLOY</div>
                <div className="absolute w-56 h-56 border border-cyan-400/40 bg-blue-600/10 flex items-center justify-center font-exo font-bold text-sm tracking-wider text-cyan-400/80 [transform:rotateX(90deg)_translateZ(112px)]">INNOVATE</div>
                <div className="absolute w-56 h-56 border border-cyan-400/40 bg-blue-600/10 flex items-center justify-center font-exo font-bold text-sm tracking-wider text-cyan-400/80 [transform:rotateX(-90deg)_translateZ(112px)]">DELIVER</div>
              </div>
            </div>
          </div>

          {/* About us text description */}
          <div className="space-y-6">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/5 px-3 py-1 rounded border border-cyan-400/20 inline-block">Our Story</div>
            <h2 className="font-exo font-extrabold text-3xl md:text-5xl text-white leading-tight">
              Shaping the Future of <span className="text-cyan-400">Digital Platforms</span>
            </h2>
            <p className="text-gray-400 font-medium text-[1.05rem] leading-relaxed">
              MANUSOFtech is a full-service creative-tech bureau operating at the intersection of beauty and performance. We build user-centric applications, optimize business processes through code, and output stunning 3D animation.
            </p>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Our streamlined operations guarantee that everything you need - from initial design mockups to the final scalable cloud deployment - is executed by our expert unified team. No outsourcing, no communications gaps.
            </p>

            {/* Performance Stats Counters */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-sky-400/20">
              <div>
                <div className="text-2xl md:text-4xl font-exo font-black text-cyan-400">{projectsCount}+</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Projects Completed</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl font-exo font-black text-sky-400">{clientsCount}+</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl font-exo font-black text-white">{servicesCount}</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Core Tech Verticals</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PORTFOLIO PROJECT SHOWCASE GALLERY */}
      <section id="portfolio" className="relative px-6 md:px-12 py-24 bg-gradient-to-b from-[#060f26] to-[#0d1b3e]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Our Work</div>
          <h2 className="font-exo font-extrabold text-3xl md:text-5xl text-white">
            Spotlight on Our <span className="text-cyan-400">Projects</span>
          </h2>
          <div className="w-12 h-1 bg-cyan-400 mx-auto rounded-full" />
          <p className="text-gray-400 font-medium text-[1.1rem]">
            We turn complicated system frameworks into straightforward, engaging user interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {portfolioData.map((project) => (
            <div 
              key={project.id}
              className="group relative rounded-2xl overflow-hidden border border-sky-400/20 bg-white/5 aspect-[4/3] flex items-end hover:border-cyan-400/40 hover:shadow-[0_20px_50px_rgba(0,212,255,0.1)] transition-all duration-300"
            >
              {/* Inner giant styled icon representing the app */}
              <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 select-none">
                {project.icon}
              </div>

              {/* Gradient layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f26]/95 via-[#060f26]/60 to-transparent z-10" />

              {/* Content panel */}
              <div className="relative z-20 p-6 space-y-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                <div 
                  className="text-xs font-bold uppercase tracking-widest font-exo"
                  style={{ color: project.color }}
                >
                  {project.tag}
                </div>
                <h4 className="font-exo font-extrabold text-lg text-white">{project.name}</h4>
                <p className="text-gray-400 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC PROGRESS WORKFLOW PATH */}
      <section id="process" className="relative px-6 md:px-12 py-24 bg-[#060f26]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Our Blueprint</div>
          <h2 className="font-exo font-extrabold text-3xl md:text-5xl text-white">
            Our <span className="text-cyan-400">Process Path</span>
          </h2>
          <div className="w-12 h-1 bg-cyan-400 mx-auto rounded-full" />
          <p className="text-gray-400 font-medium text-[1.1rem]">
            How we translate your conceptual ideas into market-tested digital products.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 md:before:content-[''] md:before:absolute md:before:top-9 md:before:left-[10%] md:before:right-[10%] md:before:h-[2px] md:before:bg-gradient-to-r md:before:from-blue-600/30 md:before:via-cyan-400/50 md:before:to-blue-600/30 md:before:z-0">
          {processData.map((step) => (
            <div key={step.step} className="relative z-10 text-center flex-1 max-w-[200px] group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-exo font-black text-xl mb-4 mx-auto shadow-[0_0_20px_rgba(0,212,255,0.25)] group-hover:scale-110 transition-transform duration-300">
                {step.step}
              </div>
              <h5 className="font-exo font-bold text-sm mb-1 text-white">{step.title}</h5>
              <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT US & INTEGRATED SUPABASE LEAD FORM */}
      <section id="contact" className="relative px-6 md:px-12 py-24 bg-gradient-to-b from-[#060f26] to-[#0d1b3e] grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
        
        {/* Contact links column */}
        <div className="space-y-6">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Connect With Us</div>
          <h2 className="font-exo font-extrabold text-3xl md:text-5xl text-white">
            Let's Start a <span className="text-cyan-400">Collaboration</span>
          </h2>
          <p className="text-gray-400 font-medium text-[1.1rem]">
            Whether you want to launch a website, design a high-fidelity mockup, or produce 3D animation, we are here.
          </p>

          <div className="flex flex-col gap-4 mt-8">
            <a 
              href="mailto:manusoftech0@gmail.com"
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="flex items-center gap-4 p-4 rounded-xl border border-sky-400/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 transition-all group"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-lg shadow-md">
                <Mail size={18} />
              </div>
              <div>
                <div className="font-exo text-xs font-bold text-cyan-400 uppercase tracking-wide">Email Us</div>
                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">manusoftech0@gmail.com</div>
              </div>
            </a>

            <a 
              href="https://www.instagram.com/manusoftech?igsh=MWg2NG8yNGE0YmZ1cQ==" 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="flex items-center gap-4 p-4 rounded-xl border border-sky-400/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 transition-all group"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-lg shadow-md">
                📸
              </div>
              <div>
                <div className="font-exo text-xs font-bold text-orange-400 uppercase tracking-wide">Instagram</div>
                <div className="font-bold text-white group-hover:text-orange-400 transition-colors">@manusoftech</div>
              </div>
            </a>

            <a 
              href="https://youtube.com/@manusoftech?si=ZDBcoNVIvgyY7gOj" 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="flex items-center gap-4 p-4 rounded-xl border border-sky-400/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 transition-all group"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#ff0000] to-[#b30000] flex items-center justify-center text-lg shadow-md">
                ▶️
              </div>
              <div>
                <div className="font-exo text-xs font-bold text-red-400 uppercase tracking-wide">YouTube Channel</div>
                <div className="font-bold text-white group-hover:text-red-400 transition-colors">@manusoftech</div>
              </div>
            </a>

            <a 
              href="https://www.linkedin.com/in/manoj-m-0099b43b5?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={() => handleInteractiveHover(true)} 
              onMouseLeave={() => handleInteractiveHover(false)}
              className="flex items-center gap-4 p-4 rounded-xl border border-sky-400/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 transition-all group"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#0077b5] to-[#00a0dc] flex items-center justify-center text-lg shadow-md">
                💼
              </div>
              <div>
                <div className="font-exo text-xs font-bold text-blue-400 uppercase tracking-wide">LinkedIn Profile</div>
                <div className="font-bold text-white group-hover:text-blue-400 transition-colors">Manoj M - Founder</div>
              </div>
            </a>
          </div>
        </div>

        {/* Supabase backend connection Form */}
        <div className="rounded-2xl p-6 md:p-8 bg-white/5 border border-sky-400/15 shadow-xl space-y-4">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Inquiry Form</div>
          <h3 className="font-exo font-bold text-xl text-white">Send Us a Quick Message</h3>
          
          {currentUser ? (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Name *</label>
                <input 
                  type="text" 
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2.5 px-4 text-sm text-white focus:border-cyan-400 outline-none transition-colors font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2.5 px-4 text-sm text-white focus:border-cyan-400 outline-none transition-colors font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Number *</label>
                <input 
                  type="tel" 
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2.5 px-4 text-sm text-white focus:border-cyan-400 outline-none transition-colors font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Required</label>
                <select 
                  value={contactService}
                  onChange={(e) => setContactService(e.target.value)}
                  className="w-full bg-[#06122d] border border-sky-400/25 rounded-lg py-2.5 px-4 text-sm text-white focus:border-cyan-400 outline-none transition-colors font-bold"
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                <textarea 
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us about your project or requirements..."
                  className="w-full bg-white/5 border border-sky-400/25 rounded-lg py-2.5 px-4 text-sm text-white focus:border-cyan-400 outline-none transition-colors resize-none font-medium"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-exo font-bold text-sm tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message ✈'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6 bg-[#040c1e]/60 border border-sky-400/10 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 animate-pulse text-2xl">
                🔒
              </div>
              <div className="space-y-2">
                <h4 className="font-exo font-extrabold text-lg text-white tracking-wide uppercase">Login Required</h4>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed font-rajdhani">
                  Please sign up or sign in to activate the secure inquiry transmission pipeline and log a message or requirements with our master engineers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-exo font-extrabold text-xs tracking-widest uppercase rounded-lg transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)]"
              >
                Sign In / Sign Up 🔑
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER & LOGO */}
      <footer className="footer bg-[#030a1a] py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-sky-400/20 text-sm text-gray-400 font-rajdhani">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <div className="font-exo font-bold">
            MANUSOF<span className="text-cyan-400">tech</span>
          </div>
        </div>
        <div>
          © 2026 MANUSOFtech. Innovation • Technology • Excellence. All rights reserved.
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAdminOpen(true)}
            className="text-xs text-sky-400 hover:text-cyan-400 font-bold flex items-center gap-1.5 focus:outline-none"
          >
            <Lock size={12} /> Database Portal
          </button>
        </div>
      </footer>

      {/* REAL-TIME NOTIFICATION TOAST BAR */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-exo font-bold px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-2 border border-cyan-400/50 animate-slideUp">
          {toastMessage}
        </div>
      )}

      {/* POPUP GET QUOTE MODAL */}
      {quoteModalOpen && (
        <QuoteModal 
          onClose={() => setQuoteModalOpen(false)}
          onSuccess={() => {
            setToastMessage('✅ Your quote request has been saved successfully!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }}
        />
      )}

      {/* POPUP AUTHENTICATION (SIGN IN & SIGN UP) MODAL */}
      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(email, name) => {
            setToastMessage(`✨ Signed in successfully as ${name || email}!`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }}
        />
      )}

      {/* POPUP CLIENT INQUIRY REGISTRY WORKSPACE */}
      {clientDashboardOpen && currentUser && (
        <ClientDashboard 
          userEmail={currentUser.email}
          userDisplayName={currentUser.displayName}
          onClose={() => setClientDashboardOpen(false)}
          onSignOut={async () => {
            setClientDashboardOpen(false);
            try {
              await supabase.auth.signOut();
              setToastMessage('👋 Successfully signed out!');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4500);
            } catch (err: any) {
              console.error(err);
            }
          }}
        />
      )}

      {/* POPUP ADMIN LEAD MANAGER CRM PANEL */}
      {adminOpen && (
        <AdminDashboard 
          onClose={() => setAdminOpen(false)}
        />
      )}

    </div>
  );
}
