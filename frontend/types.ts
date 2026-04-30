export type FlowIntensity = 'Light' | 'Normal' | 'Heavy';
export type PainLevel = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  // ✅ NEW: Added for Enterprise & Govt routing (optional so old users don't break)
  role?: string; 
}

// ✅ NEW: Added for the Department/Admin Dashboards
export interface LeaveRequest {
  id: number;
  studentId: string;
  risk: 'High' | 'Medium' | 'Low';
  hbLevel: number;
  status: string;
}

export interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string;
  cycleLength: number;
  duration: number;
  flowIntensity: FlowIntensity;
  painLevel: PainLevel;
  symptoms: string[];
  isMissed: boolean;
  notes: string;
}

export interface HealthRisk {
  condition: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  reasoning: string;
  recommendations: string[];
}

export interface WellnessPlan {
  dietChart: { meal: string; recommendation: string }[];
  yogaPoses: { name: string; benefit: string }[];
  foodHabits: string[];
}

export interface AnalysisResult {
  overallHealthScore: number;
  risks: HealthRisk[];
  wellnessPlan: WellnessPlan;
  summary: string;
  disclaimer: string;
}

export interface UserProfile {
  age: number;
  averageCycleLength: number;
  location?: string;
  lastAnalysisDate?: string;
}
// Inside types.ts
export interface User {
  id: string; // or _id: string;
  email: string;
  name: string;
  password?: string;
  role?: string;
  // 👇 Add this line!
  profile?: UserProfile; 
}