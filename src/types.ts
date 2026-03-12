export interface SelectedEvent {
  name: string;
  teamName?: string;
  count: number | '';
  pptTheme?: string;
  pptTopic?: string;
  pptAbstract?: string;
  softwareRequest?: string;
  gameRequest?: string;
}


export interface Registration {
  id: number;
  reg_id: string;
  full_name: string;
  college_name: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  transaction_id: string;
  events_json: string; // JSON string of SelectedEvent[]
  payment_screenshot?: string;
  created_at: string;
}

export interface LiveActivity {
  regId: string;
  fullName: string;
  collegeName: string;
  department: string;
  year: string;
  events: SelectedEvent[];
  total: number;
  timestamp: string;
}

export type Year = '1st' | '2nd' | '3rd' | '4th';
export type Department = string;

export interface Event {
  id: string;
  name: string;
  category: 'Technical' | 'Non-Technical';
  description: string;
  rules: string[];
  maxParticipants: number;
  years: Year[];
  image?: string;
}
