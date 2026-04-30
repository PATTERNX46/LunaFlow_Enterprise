import React, { useState, useEffect } from 'react';
import { X, Send, ShieldAlert, Loader2, Brain, FileCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
  user?: any;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LeaveRequestModal: React.FC<Props> = ({ onClose, user }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [latestHb, setLatestHb] = useState<number | null>(null);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [applicantData, setApplicantData] = useState({ id: '', name: 'Student', role: 'female_user' });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoadingVitals(true);

        let currentId = user?.user_id || user?._id || user?.id;
        let currentName = user?.name || "Student";
        let currentRole = user?.role || "female_user";

        if (!currentId) {
          const userStr = localStorage.getItem('lunaflow_session') || localStorage.getItem('user');
          if (userStr) {
              try {
                  const userObj = JSON.parse(userStr);
                  currentId = userObj._id || userObj.id || userObj.user_id;
                  currentName = userObj.name || currentName;
                  currentRole = userObj.role || currentRole;
              } catch (e) {}
          }
        }

        if (!currentId) {
            alert("Error: User ID not found! Please login again.");
            setLoadingVitals(false);
            return;
        }

        setApplicantData({ id: currentId, name: currentName, role: currentRole });

       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const [reportRes, hbRes] = await Promise.all([
    fetch(`${API_URL}/analysis/${currentId}`),
    fetch(`${API_URL}/hb/${currentId}`)
]);
        
        const reports = await reportRes.json();
        const hbs = await hbRes.json();

        if (Array.isArray(reports) && reports.length > 0) setLatestReport(reports[0]);
        if (Array.isArray(hbs) && hbs.length > 0) setLatestHb(hbs[0].hbValue);

      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally {
        setLoadingVitals(false);
      }
    };
    
    fetchAllData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mlText = (latestReport?.mlPredictionText || "").toLowerCase();
    let finalRisk = "Low"; 
    if (mlText.includes('high') || mlText.includes('risk') || mlText.includes('severe') || mlText.includes('anemic')) {
      finalRisk = "High";
    }

    // 🌟 MAGIC FIX: Sending the ENTIRE AI Report object to Database
    const fullReportString = latestReport ? JSON.stringify(latestReport) : "No detailed medical assessment found.";

    const payload = {
      applicantId: applicantData.id,
      applicantName: applicantData.name,
      applicantRole: applicantData.role,
      reason: reason,
      riskLevel: finalRisk,
      hbLevel: latestHb || 0,
      aiReportSummary: fullReportString,
      vitalityScore: latestReport?.overallHealthScore ? String(latestReport.overallHealthScore) : "N/A"
    };

    try {
      const res = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("✅ Official leave request submitted with the Comprehensive Medical Report attached!");
        onClose();
      } else {
        alert("❌ Failed to submit request. Check server.");
      }
    } catch (err) {
      alert("❌ Submission error. Server might be down.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-rose-500 to-indigo-600 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><FileCheck size={24} /> Official Leave Request</h2>
            <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest mt-1">LunaFlow Medical Ecosystem</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><Brain size={80} /></div>
            <p className="text-[10px] font-black text-indigo-500 uppercase mb-3 flex items-center gap-1 relative z-10">
              <FileCheck size={12} /> Automatically Attached Medical Report
            </p>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm border-b border-indigo-100 pb-2">
                <span className="text-slate-500 font-medium">Applicant:</span>
                <span className="text-slate-800 font-bold">{applicantData.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-indigo-100 pb-2">
                <span className="text-slate-500 font-medium">Hemoglobin (Hb):</span>
                {/* 🌟 FIXED: If no Hb is found, show "Not Recorded" instead of infinite "Scanning..." */}
                <span className="text-slate-800 font-black">
                  {loadingVitals ? "Scanning..." : latestHb ? `${latestHb} g/dL` : "Not Recorded"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Vitality Score:</span>
                <span className={`font-black text-lg ${latestReport?.overallHealthScore < 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                   {loadingVitals ? "..." : latestReport?.overallHealthScore ? `${latestReport.overallHealthScore}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Reason for Leave</label>
            <textarea 
              rows={3} required value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Add any additional details..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            />
          </div>

          <button type="submit" disabled={isSubmitting || loadingVitals || !applicantData.id} className="w-full bg-slate-900 py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {isSubmitting ? 'Sending Report...' : 'Submit with AI Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;