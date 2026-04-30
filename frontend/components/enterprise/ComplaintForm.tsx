import React, { useState } from 'react';
import { AlertTriangle, Camera, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  user?: any;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function ComplaintForm({ user }: Props) {
  const [issueType, setIssueType] = useState('washroom');
  const [description, setDescription] = useState('');
  const [evidenceBase64, setEvidenceBase64] = useState<string | null>(null); // 🌟 State to store image
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 NEW: Convert selected image to Base64 String
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return alert("Please provide details for your grievance.");
    
    setIsSubmitting(true);

    try {
      // 1. Get user details
      let currentId = user?.user_id || user?._id || user?.id;
      let currentName = user?.name || "Student";
      let currentRole = user?.role || "female_user";

      if (!currentId) {
        const sessionStr = localStorage.getItem('lunaflow_session') || localStorage.getItem('user');
        if (sessionStr) {
            try {
                const userObj = JSON.parse(sessionStr);
                currentId = userObj._id || userObj.id || userObj.user_id;
                currentName = userObj.name || currentName;
                currentRole = userObj.role || currentRole;
            } catch (e) {}
        }
      }

      // 2. Hierarchical Routing Logic
      let targetRole = 'dept_head'; // Default goes to Dept Head
      if (currentRole === 'dept_head' || currentRole === 'hod') targetRole = 'admin';
      if (currentRole === 'admin') targetRole = 'state_govt';
      if (currentRole === 'state_govt') targetRole = 'central_govt';

      // 🌟 Include "evidence" in payload
      const payload = {
        applicantId: currentId || "Unknown",
        applicantName: currentName,
        applicantRole: currentRole,
        targetRole: targetRole,
        type: issueType,
        description: description,
        evidence: evidenceBase64, // <-- Added Image Data here
        status: 'Pending'
      };

      // 3. Send to Backend
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("✅ Grievance officially lodged and securely routed to Higher Authority.");
        setDescription(''); 
        setEvidenceBase64(null); // Clear image after success
      } else {
        alert("❌ Failed to submit grievance. Check server connection.");
      }
    } catch (err) {
      alert("❌ Error connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" /> Lodge Institute Grievance
        </h3>
        <p className="text-slate-500 text-sm mt-1">Report unhygienic washrooms or bad water supply securely.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issue Type</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={issueType} 
              onChange={(e) => setIssueType(e.target.value)} 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none font-medium text-slate-700"
            >
              <option value="washroom">Unclean / Unhygienic Washroom</option>
              <option value="water">Bad Water Supply / No Water</option>
              <option value="pad_machine">Sanitary Pad Vending Machine Empty/Broken</option>
              <option value="harassment">Harassment / Safety Issue</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Evidence (Photo)</label>
          {/* 🌟 Dynamic UI: Changes color when an image is successfully selected */}
          <div className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden ${evidenceBase64 ? 'bg-orange-50 border-orange-400 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-orange-300'}`}>
            {evidenceBase64 ? (
               <>
                 <CheckCircle2 size={32} className="mb-2 text-orange-500" />
                 <span className="text-sm font-bold text-orange-700">Image Attached Successfully!</span>
                 <p className="text-xs mt-1 font-medium opacity-80">Click to change image</p>
               </>
            ) : (
               <>
                 <Camera size={32} className="mb-2 text-slate-300" />
                 <span className="text-sm font-bold text-slate-600">Click to upload photo</span>
               </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location / Details</label>
          <textarea 
            rows={3}
            required
            placeholder="e.g., 3rd Floor, BCA Department Washroom..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-slate-700 resize-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !description.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {isSubmitting ? 'Routing Securely...' : 'Submit to Administration'}
        </button>
      </form>
    </div>
  );
}