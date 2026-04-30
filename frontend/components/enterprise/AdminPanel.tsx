import React, { useState, useEffect } from 'react';
import { Building, FileWarning, BarChart, CheckCircle2, Calendar, Activity, AlertCircle, XCircle } from 'lucide-react';

interface Props {
  complaints: any[];
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function AdminPanel({ complaints }: Props) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all Leave Requests from the database on component mount
  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_URL}/leaves`);
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Handler to update Leave Status (Approve/Reject)
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Optimistically update the local state to reflect changes immediately
        setLeaves(prev => prev.map(leave => 
          leave._id === id ? { ...leave, status: newStatus } : leave
        ));
      }
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  return (
    <div className="mt-6 space-y-8 animate-in slide-in-from-bottom-4">
      
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Building size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Departments</p>
            <p className="text-2xl font-black text-slate-800">4</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Calendar size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Leave Requests</p>
            <p className="text-2xl font-black text-slate-800">{leaves.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><BarChart size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Health</p>
            <p className="text-2xl font-black text-emerald-500">94%</p>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Leave Applications with AI Insights */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-rose-100 overflow-hidden">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <Calendar className="text-rose-500" /> Medical Leave Applications
        </h3>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">Student Details</th>
                <th className="p-5">Reason</th>
                <th className="p-5">Hb Vitals</th>
                <th className="p-5">AI Risk Level</th>
                <th className="p-5">Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold">Loading applications...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold">No leave requests found.</td></tr>
              ) : (
                leaves.map((leave, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {/* Render Student Name and ID */}
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{leave.applicantName || "Student Name"}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{leave.applicantId}</p>
                    </td>
                    
                    {/* Render Leave Reason */}
                    <td className="p-5 text-sm text-slate-600 font-medium italic">"{leave.reason}"</td>
                    
                    {/* Render Dynamic Hemoglobin Data from LunaClip */}
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-rose-500" />
                        <span className="font-bold text-slate-700">{leave.hbLevel > 0 ? `${leave.hbLevel} g/dL` : "Scanning..."}</span>
                      </div>
                    </td>

                    {/* Render AI Risk Level */}
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit
                        ${leave.riskLevel === 'High' ? 'bg-rose-100 text-rose-600' : 
                          leave.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        <AlertCircle size={12} />
                        {leave.riskLevel || "Unknown"}
                      </span>
                    </td>

                    {/* Action Column: Displays buttons if Pending, otherwise shows status */}
                    <td className="p-5">
                      {leave.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {leave.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institute-Wide Grievance Reports Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <FileWarning className="text-orange-500" /> Institute-Wide Grievance Reports
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">Date</th>
                <th className="p-5">Grievance Type</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((comp, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-5 text-sm text-slate-500 font-medium">{new Date(comp.date).toLocaleDateString()}</td>
                  <td className="p-5 font-bold text-slate-700 capitalize">{comp.type.replace('_', ' ')}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button disabled={comp.status === 'Resolved'} className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-400 rounded-xl transition-colors">
                      <CheckCircle2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}