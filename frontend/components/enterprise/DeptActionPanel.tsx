import React, { useState, useEffect } from 'react';
import { Users, ShieldAlert, CheckCircle2, XCircle, MessageSquare, Eye, X, Brain, Activity, Utensils, Flower2, Apple, FileWarning, ArrowRight, ImageIcon } from 'lucide-react';

interface Props {
  leaves: any[];
  complaints?: any[];
  userRole?: string;
}

export default function DeptActionPanel({ leaves, complaints = [], userRole = 'dept_head' }: Props) {
  const [loadingAlert, setLoadingAlert] = useState<string | null>(null);
  
  // Local States
  const [localLeaves, setLocalLeaves] = useState<any[]>([]);
  const [localComplaints, setLocalComplaints] = useState<any[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null); // 🌟 NEW: For viewing complaint details/image

  // Sync props to state
  useEffect(() => {
    setLocalLeaves(leaves);
    setLocalComplaints(complaints);
  }, [leaves, complaints]);

  // ==========================================
  // 1. LEAVE LOGIC (Unchanged)
  // ==========================================
  const triggerWhatsAppAlert = async (studentId: string) => {
    setLoadingAlert(studentId);
    try {
      const sessionStr = localStorage.getItem('lunaflow_session');
      const role = sessionStr ? JSON.parse(sessionStr).role : 'dept_head';

      const res = await fetch('http://localhost:8000/api/institute/trigger-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, role: role })
      });

      const data = await res.json();
      if (res.ok) alert(`✅ ${data.message}`);
      else alert(`❌ Failed: ${data.detail}`);
    } catch (err) {
      alert("Connection failed. Is the Python backend running?");
    } finally {
      setLoadingAlert(null);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${leaveId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        alert(`✅ Leave request has been officially APPROVED.`);
        setLocalLeaves(localLeaves.filter(leave => (leave._id || leave.id) !== leaveId));
        setSelectedLeave(null); 
      }
    } catch (err) { alert("Failed to connect to database"); }
  };

  const handleDecline = async (leaveId: string) => {
    if (window.confirm(`❌ Are you sure you want to DECLINE this leave request?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/leaves/${leaveId}/status`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ status: 'Declined' })
        });
        if (res.ok) {
          setLocalLeaves(localLeaves.filter(leave => (leave._id || leave.id) !== leaveId));
          setSelectedLeave(null);
        }
      } catch (err) { alert("Failed to connect to database"); }
    }
  };

  const getFullReport = (summaryString: string) => {
    if (!summaryString) return null;
    try {
      if (summaryString.trim().startsWith('{')) {
        return JSON.parse(summaryString);
      }
    } catch (e) {}
    return null;
  };

  // ==========================================
  // 2. 🌟 GRIEVANCE LOGIC (Enhanced with Image support)
  // ==========================================
  const handleComplaintAction = async (complaintId: string, action: 'Resolved' | 'Forward') => {
    try {
      let payload: any = { status: action };
      
      if (action === 'Forward') {
        let nextRole = 'admin';
        if (userRole === 'dept_head') nextRole = 'admin';
        if (userRole === 'admin') nextRole = 'state_govt';
        if (userRole === 'state_govt') nextRole = 'central_govt';
        
        payload = { status: 'Forwarded', forwardTo: nextRole };
      }

      const res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`✅ Grievance successfully ${action === 'Forward' ? 'Forwarded to Higher Authority' : 'Resolved'}.`);
        setLocalComplaints(prev => prev.filter(c => (c._id || c.id) !== complaintId));
        setSelectedComplaint(null);
      }
    } catch (err) {
      alert("Failed to process grievance. Check server.");
    }
  };

  return (
    <div className="bg-transparent mt-6 animate-in slide-in-from-bottom-4 space-y-8">
      
      {/* PANEL 1: LEAVE APPROVALS */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <Users className="text-indigo-600 p-2 bg-indigo-50 rounded-xl" size={36} /> 
            Department Leave Approvals
          </h3>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">Applicant Name</th>
                <th className="p-5">AI Risk & Hb Vitals</th>
                <th className="p-5">Stated Reason</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {localLeaves.map((leave, idx) => {
                const dbId = leave._id || leave.id;
                const studentId = leave.applicantId || leave.studentId;

                return (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{leave.applicantName || "Student"}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{studentId}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className={`w-max px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${leave.riskLevel === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {leave.riskLevel} RISK
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <ShieldAlert size={12} /> Hb: {leave.hbLevel > 0 ? `${leave.hbLevel} g/dL` : 'Not Recorded'}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-600 font-medium max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedLeave(leave)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors" title="View Full Report"><Eye size={18} /></button>
                        {leave.riskLevel === 'High' && (
                          <button onClick={() => triggerWhatsAppAlert(studentId)} disabled={loadingAlert === studentId} className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl disabled:opacity-50" title="Emergency WhatsApp"><MessageSquare size={18} /></button>
                        )}
                        <button onClick={() => handleApprove(dbId)} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-bold" title="Approve"><CheckCircle2 size={18} /></button>
                        <button onClick={() => handleDecline(dbId)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold" title="Decline"><XCircle size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {localLeaves.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No pending leave requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL 2: PENDING GRIEVANCES */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-orange-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <FileWarning className="text-orange-600 p-2 bg-orange-50 rounded-xl" size={36} /> 
            Pending Grievances / Complaints
          </h3>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">Applicant Details</th>
                <th className="p-5">Issue Type</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-right">Actions (Hierarchical)</th>
              </tr>
            </thead>
            <tbody>
              {localComplaints.map((comp, idx) => {
                const dbId = comp._id || comp.id;

                return (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{comp.applicantName || "Anonymous"}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{comp.applicantId}</p>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600">
                        {comp.type}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-600 font-medium max-w-xs truncate" title={comp.description}>
                      {comp.description}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 🌟 NEW: View Details Button (Shows Image if exists) */}
                        <button 
                          onClick={() => setSelectedComplaint(comp)} 
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                          title="View Grievance Details"
                        >
                          <Eye size={18} />
                        </button>

                        <button 
                          onClick={() => handleComplaintAction(dbId, 'Resolved')} 
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-bold flex items-center gap-1 text-xs transition-colors"
                        >
                          <CheckCircle2 size={16} /> Resolve
                        </button>
                        
                        <button 
                          onClick={() => handleComplaintAction(dbId, 'Forward')} 
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold flex items-center gap-1 text-xs transition-colors"
                        >
                          <ArrowRight size={16} /> Forward 
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {localComplaints.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No pending grievances assigned to you.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: FULL MEDICAL REPORT */}
      {selectedLeave && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2"><Brain size={20} /> Full Medical Assessment</h2>
                <p className="text-indigo-200 text-xs font-medium mt-1">Applicant: {selectedLeave.applicantName || selectedLeave.applicantId}</p>
              </div>
              <button onClick={() => setSelectedLeave(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {(() => {
                const fullReport = getFullReport(selectedLeave.aiReportSummary);
                const score = selectedLeave.vitalityScore || (fullReport ? fullReport.overallHealthScore : 'N/A');
                
                return (
                  <>
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-center w-1/2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vitality Score</p>
                        <p className={`text-2xl font-black ${score !== 'N/A' && score < 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {score !== 'N/A' ? `${score}%` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center w-1/2 border-l border-slate-200 pl-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hb Level</p>
                        <p className="text-2xl font-black text-slate-700">
                          {selectedLeave.hbLevel > 0 ? `${selectedLeave.hbLevel} g/dL` : 'Not Recorded'}
                        </p>
                      </div>
                    </div>

                    {fullReport ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity size={14} className="text-indigo-500" /> Diagnostic Summary
                          </h4>
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-indigo-900 text-sm leading-relaxed font-medium">
                            {fullReport.summary}
                          </div>
                        </div>

                        {fullReport.risks?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <ShieldAlert size={14} className="text-rose-500" /> Secondary Health Indicators
                            </h4>
                            <div className="space-y-3">
                              {fullReport.risks.map((risk: any, i: number) => (
                                <div key={i} className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                                  <p className="font-bold text-slate-800 text-sm">
                                    {risk.condition} 
                                    <span className="text-[9px] font-black bg-rose-200 text-rose-700 px-2 py-0.5 rounded-full ml-2 uppercase">{risk.riskLevel} Risk</span>
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">{risk.reasoning}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {fullReport.wellnessPlan?.dietChart?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Utensils size={14} className="text-orange-500" /> Regional Diet Chart
                            </h4>
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl space-y-2">
                              {fullReport.wellnessPlan.dietChart.map((diet: any, i: number) => (
                                <div key={i} className="text-xs text-slate-700">
                                  <span className="font-black text-orange-700 uppercase mr-2">{diet.meal}:</span>
                                  {diet.recommendation}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fullReport.wellnessPlan?.yogaPoses?.length > 0 && (
                            <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-1"><Flower2 size={12}/> Yoga Routine</h4>
                              {fullReport.wellnessPlan.yogaPoses.map((pose: any, i: number) => (
                                <p key={i} className="text-xs text-slate-700 mb-1"><strong>{pose.name}</strong></p>
                              ))}
                            </div>
                          )}
                          {fullReport.wellnessPlan?.foodHabits?.length > 0 && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1"><Apple size={12}/> Food Habits</h4>
                              <ul className="list-disc pl-4 text-xs text-slate-700">
                                {fullReport.wellnessPlan.foodHabits.map((habit: string, i: number) => (
                                  <li key={i}>{habit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Assessment Summary</h4>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-indigo-900 text-sm leading-relaxed font-medium">
                          {selectedLeave.aiReportSummary || "No AI Health Assessment found."}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stated Reason / Note from Student</p>
                <p className="text-slate-700 leading-relaxed font-medium">{selectedLeave.reason}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
              <button onClick={() => handleDecline(selectedLeave._id || selectedLeave.id)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors border border-rose-200">
                <XCircle size={18}/> Decline
              </button>
              <button onClick={() => handleApprove(selectedLeave._id || selectedLeave.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-200">
                <CheckCircle2 size={18}/> Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 NEW MODAL 2: GRIEVANCE DETAIL & EVIDENCE VIEW */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            <div className="bg-orange-500 p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2"><FileWarning size={20} /> Grievance Evidence</h2>
                <p className="text-orange-100 text-xs font-medium mt-1">Issue: {selectedComplaint.type}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Evidence Photo */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ImageIcon size={14} className="text-orange-500" /> Attached Photo Evidence
                </h4>
                {selectedComplaint.evidence ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img 
                      src={selectedComplaint.evidence} 
                      alt="Complaint Evidence" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-400 italic text-sm">
                    No photo evidence was uploaded with this report.
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2 text-left">Location & Details from Student</p>
                <p className="text-slate-700 leading-relaxed font-medium text-left">{selectedComplaint.description}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
              <button 
                onClick={() => handleComplaintAction(selectedComplaint._id || selectedComplaint.id, 'Forward')} 
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors border border-blue-200"
              >
                <ArrowRight size={18}/> Forward
              </button>
              <button 
                onClick={() => handleComplaintAction(selectedComplaint._id || selectedComplaint.id, 'Resolved')} 
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-200"
              >
                <CheckCircle2 size={18}/> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}