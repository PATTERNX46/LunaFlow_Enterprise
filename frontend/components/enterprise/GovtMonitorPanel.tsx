import React from 'react';
import { Globe, Activity, Building2, TrendingUp } from 'lucide-react';

interface Props {
  role: string;
}

export default function GovtMonitorPanel({ role }: Props) {
  const isCentral = role === 'central_govt';

  // Mock macro data (All States)
  const allOrgData = [
    { id: 'ORG-01', name: 'RCC Institute of Information Technology', region: 'West Bengal', resolved: '94%', health: 'Excellent' },
    { id: 'ORG-04', name: 'Kolkata National Medical College', region: 'West Bengal', resolved: '89%', health: 'Good' },
    { id: 'ORG-02', name: 'State Medical College', region: 'Maharashtra', resolved: '68%', health: 'Needs Audit' },
    { id: 'ORG-03', name: 'National Tech University', region: 'Delhi', resolved: '88%', health: 'Good' },
  ];

  // 🌟 LOGIC FIX: Filter data based on Authority Level
  // If Central Govt, show everything. If State Govt (our mock user is WB), show only WB.
  const displayData = isCentral 
    ? allOrgData 
    : allOrgData.filter(org => org.region === 'West Bengal');

  return (
    <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4">
      {/* Govt Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <Globe size={150} className="absolute -right-10 -bottom-10 text-white opacity-10" />
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3 relative z-10">
          <Activity size={32} /> {isCentral ? 'National' : 'West Bengal State'} Menstrual Health Monitor
        </h2>
        <p className="text-blue-100 font-medium relative z-10 max-w-2xl">
          {isCentral 
            ? 'Macro-level oversight of all institutions across India. Individual privacy is strictly maintained.' 
            : 'State-level oversight of institutional compliance and hygiene standards within West Bengal. Individual privacy is strictly maintained.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayData.map((org, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col group hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{org.name}</h4>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{org.region}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 uppercase tracking-widest">Grievance Resolution</span>
                  <span className="text-slate-800">{org.resolved}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${parseInt(org.resolved) > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: org.resolved }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-sm font-medium text-slate-500">Compliance Health</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${org.health === 'Excellent' || org.health === 'Good' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {org.health}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}