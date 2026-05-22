export interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  type: 'contact' | 'quote';
  status: 'New' | 'In Progress' | 'Contacted' | 'Completed';
  company?: string;
  budget?: string;
}

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  icon: string;
  tag: string;
  name: string;
  description: string;
  color: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}
