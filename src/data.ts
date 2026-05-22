import { ServiceItem, PortfolioItem, ProcessStep } from './types';

export const servicesData: ServiceItem[] = [
  {
    id: 'uiux',
    icon: '🎨',
    title: 'UI/UX Design',
    description: 'Beautiful, intuitive interfaces that delight users. We design with empathy, user research, and precision to ensure every digital interaction is absolute eye-candy.'
  },
  {
    id: 'web',
    icon: '💻',
    title: 'Website Designing',
    description: 'Responsive, lightning-fast, and visually stunning websites built with modern technologies. From corporate homepages to full-scale web application portals.'
  },
  {
    id: 'app',
    icon: '📱',
    title: 'Mobile App Development',
    description: 'Smooth, native, and cross-platform mobile apps for iOS and Android. High-performance, highly secure development matching modern operating standards.'
  },
  {
    id: 'ecom',
    icon: '🛒',
    title: 'E-Commerce Website',
    description: 'High-converting online storefronts featuring secure payment gateways, clear product galleries, fast inventory handling, and fluid checkout funnels.'
  },
  {
    id: 'anim',
    icon: '🎬',
    title: '2D / 3D Animation',
    description: 'Captivating explainer videos, logo animations, detailed brand motion graphics, and highly realistic 3D renderings that breathe life into your product ideas.'
  },
  {
    id: 'custom',
    icon: '⚙️',
    title: 'Custom Tech Solutions',
    description: 'Tailored enterprise software designed for your bespoke business challenges. We integrate complex workflows, custom CRM metrics, and robust API logic.'
  }
];

export const portfolioData: PortfolioItem[] = [
  {
    id: 'port1',
    icon: '🎨',
    tag: 'UI/UX Design',
    name: 'Metatrade Crypto Terminal',
    description: 'Futuristic dark-themed real-time trading dashboard featuring glowing graph components, fully optimized responsive viewports, and custom high-contrast key selectors.',
    color: '#00d4ff'
  },
  {
    id: 'port2',
    icon: '🛒',
    tag: 'E-Commerce',
    name: 'Aura Luxury Boutique',
    description: 'Elegant minimalist e-commerce showcase designed with smooth image fading transitions, dynamic shopping cart slide-overs, and a robust payment gateway.',
    color: '#38bdf8'
  },
  {
    id: 'port3',
    icon: '📱',
    tag: 'Mobile App',
    name: 'Pulse Fitness Companion',
    description: 'Native iOS & Android fitness tracker integrated with smart wearable APIs, intuitive heart rate visualizer graphs, and offline-first database synchronization.',
    color: '#1a56db'
  },
  {
    id: 'port4',
    icon: '🎬',
    tag: '3D Animation',
    name: 'Cosmos Space Explorer',
    description: 'Interactive and educational 3D celestial rendering utilizing WebGL shader animations, customized galaxy particle fields, and smooth orbit-control camera physics.',
    color: '#833ab4'
  },
  {
    id: 'port5',
    icon: '💻',
    tag: 'Website',
    name: 'Acme SaaS Gateway',
    description: 'Lightning-fast marketing website with rich, engaging typography, beautiful custom vector illustrations, layered glassmorphic cards, and rapid page loading speed.',
    color: '#00ba45'
  },
  {
    id: 'port6',
    icon: '⚡',
    tag: 'Custom Solution',
    name: 'Nexus ERP Control Hub',
    description: 'Full-stack enterprise management tool bringing together supply chain logging, client invoices, sales tracking, and interactive PDF reporting dashboards.',
    color: '#e28743'
  }
];

export const processData: ProcessStep[] = [
  {
    step: '01',
    title: 'Discovery & Consultation',
    description: 'We initiate deep-dive discussions to understand your unique business visions, workflows, specific target audiences, and project criteria.'
  },
  {
    step: '02',
    title: 'Strategy & Architecture',
    description: 'Our team defines a rigorous technical blueprint, including wireframes, specific stack selections, database schemas, and UX user flows.'
  },
  {
    step: '03',
    title: 'UI/UX & Visual Design',
    description: 'We build beautiful, pixel-perfect user interfaces, high-fidelity interactive prototypes, and custom brand designs for your feedback.'
  },
  {
    step: '04',
    title: 'Modern Development',
    description: 'We translate designs into fully functional systems writing clean, modular, and optimized code, continuously integrated and thoroughly tested.'
  },
  {
    step: '05',
    title: 'Testing & Deploying',
    description: 'Our team performs full QA testing across platforms, smoothly launches your portal onto production cloud servers, and provides ongoing system support.'
  }
];
