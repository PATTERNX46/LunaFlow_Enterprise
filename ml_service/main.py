from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import joblib
import pandas as pd  
import pickle        
from twilio.rest import Client # 🌟 NEW: Twilio Integration

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 1. LOAD PRIMARY LUNAFLOW MODEL
# ---------------------------------------------------------
try:
    model_data = joblib.load('lunaflow_model.pkl')
    if isinstance(model_data, dict):
        model = model_data['model']
        classes = list(model_data['classes'])
    else:
        model = model_data
        classes = getattr(model, 'classes_', ['None']) 
except Exception as e:
    print(f"Error loading primary model: {e}")
    model = None
    classes = []

# ---------------------------------------------------------
# 2. LOAD NEW ANEMIA MODEL
# ---------------------------------------------------------
try:
    with open('anemia_model.pkl', 'rb') as f:
        anemia_model = pickle.load(f)
except Exception as e:
    print(f"Error loading anemia model: {e}")
    anemia_model = None

# ---------------------------------------------------------
# 3. PYDANTIC DATA MODELS (Core)
# ---------------------------------------------------------
class PatientData(BaseModel):
    age: int
    menstrual_cycle_length: int 
    maternal_status: int 
    period_duration: int
    blood_flow: int 
    pain_level: int 
    symptom_count: int

class AnemiaComboRequest(BaseModel):
    hemoglobin: float
    mch: float = 28.0   
    mchc: float = 33.0  
    mcv: float = 85.0   
    flow_intensity: str 

class UnifiedLoginRequest(BaseModel):
    username: str
    password: Optional[str] = "password123"

class LeaveSubmission(BaseModel):
    student_id: str
    risk_score: str
    hb_level: float
    reason: str

class ComplaintSubmission(BaseModel):
    student_id: str
    issue_type: str
    description: str

class HbSaveRequest(BaseModel):
    userId: str
    hbValue: float

class AlertRequest(BaseModel):
    student_id: str
    role: str

# ---------------------------------------------------------
# 4. UNIFIED MOCK DATABASE (With Guardian Phone Numbers)
# ---------------------------------------------------------
MOCK_USERS = {
    "student_f": {
        "id": "STU-001", "role": "female_user", "name": "Priya Sharma", "email": "priya@institute.edu",
        "guardian_phone": "whatsapp:+919876543210" # ⚠️ CHANGE THIS TO YOUR REAL NUMBER FOR TESTING
    },
    "student_m": {
        "id": "STU-002", "role": "male_user", "name": "Rahul Verma", "email": "rahul@institute.edu",
        "guardian_phone": ""
    },
    "dept_head": {
        "id": "HOD-001", "role": "dept_head", "name": "Dr. Anita Sen", "email": "hod.bca@institute.edu",
        "guardian_phone": ""
    },
    "admin_rcc": {
        "id": "ADM-001", "role": "admin", "name": "RCC Administration", "email": "admin@rcc.edu",
        "guardian_phone": ""
    },
    "state_govt": {
        "id": "GOV-001", "role": "state_govt", "name": "WB Health Monitor", "email": "health@wb.gov.in",
        "guardian_phone": ""
    },
    "central_govt": {
        "id": "GOV-002", "role": "central_govt", "name": "National Health Portal", "email": "monitor@india.gov.in",
        "guardian_phone": ""
    },
}

MOCK_LEAVES = [
    {"id": 1, "studentId": "STU-001", "risk": "High", "hbLevel": 9.2, "status": "Pending", "reason": "Severe Menorrhagia"},
    {"id": 2, "studentId": "STU-089", "risk": "Low", "hbLevel": 12.1, "status": "Approved", "reason": "Routine Checkup"}
]

MOCK_COMPLAINTS = [
    {"id": 101, "studentId": "STU-001", "type": "washroom", "status": "Pending", "date": "2026-03-22"},
    {"id": 102, "studentId": "STU-045", "type": "water", "status": "Resolved", "date": "2026-03-20"}
]

# In-memory storage for LunaClip vitals
hb_db = {}

# ---------------------------------------------------------
# 5. ORIGINAL ML ENDPOINTS (Untouched)
# ---------------------------------------------------------
@app.post("/predict_health_risk")
def predict(data: PatientData):
    if not model: return {"error": "Model not loaded"}
    is_normal_cycle = 1 if 21 <= data.menstrual_cycle_length <= 35 else 0
    feature_names = ['AGE', 'MENSTRUAL CYCLE', 'METERNAL STATUS', 'PERIOD_DURATION', 'BLOOD FLOW', 'PAIN LEVEL', 'SYMPTOM_COUNT']
    features_df = pd.DataFrame([[data.age, is_normal_cycle, data.maternal_status, data.period_duration, data.blood_flow, data.pain_level, data.symptom_count]], columns=feature_names)
    prediction = model.predict(features_df)[0]
    vitality_score = 80 
    try:
        probabilities = model.predict_proba(features_df)[0]
        if 'None' in classes:
            health_index = classes.index('None')
            vitality_score = int(probabilities[health_index] * 100)
        if prediction != 'None' and vitality_score > 60:
            vitality_score = max(15, 60 - (data.symptom_count * 5))
    except AttributeError:
        vitality_score = 90 if prediction == 'None' else 45

    if prediction == 'None':
        warning_msg = "Patterns look normal. Keep maintaining a healthy lifestyle."
    else:
        warning_msg = f"ML detected patterns indicating {prediction}. This is for awareness only. Please consult a doctor."

    return {"status": "success", "prediction": prediction, "vitalityScore": vitality_score, "warning": warning_msg}

@app.post("/predict_anemia_combo")
def predict_anemia_combo(req: AnemiaComboRequest):
    if not anemia_model: return {"error": "Anemia model not loaded"}
    feature_names = ['Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV']
    features_df = pd.DataFrame([[1, req.hemoglobin, req.mch, req.mchc, req.mcv]], columns=feature_names)
    prediction = anemia_model.predict(features_df)[0]
    is_anemic = bool(prediction == 1)
    
    if is_anemic and req.flow_intensity == 'Heavy':
        risk_level, combo_insight = "Critical", "⚠️ URGENT: Our ML detects Clinical Anemia heavily correlated with your recent 'Heavy' period logs. You are likely suffering from Menorrhagia-induced Iron Deficiency. Immediate medical consultation is required."
    elif is_anemic and req.flow_intensity != 'Heavy':
        risk_level, combo_insight = "High", "⚠️ ML detects Clinical Anemia, but your period flow is normal. This indicates your anemia is likely dietary (lack of iron/B12) rather than menstrual blood loss."
    elif not is_anemic and req.flow_intensity == 'Heavy':
        risk_level, combo_insight = "Moderate", "✅ You have a healthy Hemoglobin level despite heavy periods! Your body is regenerating blood cells effectively. Keep maintaining your iron-rich diet."
    else:
        risk_level, combo_insight = "Low", "✅ Optimal Health. Your Hemoglobin is normal and your cycle flow is stable. Excellent vitality!"
    
    return {"success": True, "is_anemic": is_anemic, "risk_level": risk_level, "combined_insight": combo_insight}


# ---------------------------------------------------------
# 6. UNIFIED ARCHITECTURE ENDPOINTS
# ---------------------------------------------------------
@app.post("/api/login")
async def unified_login(req: UnifiedLoginRequest):
    user = MOCK_USERS.get(req.username)
    if not user: raise HTTPException(status_code=401, detail="Invalid credentials. Please check your Institute ID.")
    return user

@app.get("/api/data/{user_id}")
async def get_user_data(user_id: str):
    user = next((u for u in MOCK_USERS.values() if u["id"] == user_id), None)
    name = user["name"] if user else "Patient"
    return {
        "name": name,
        "profile": {"age": 21, "averageCycleLength": 28, "location": "Kolkata, India"},
        "logs": [] 
    }

@app.post("/api/hb/save")
async def save_hb(req: HbSaveRequest):
    status = "Normal"
    if req.hbValue < 11.0: status = "Low (Anemic Risk)"
    if req.hbValue > 15.0: status = "High"
    
    record = {"date": datetime.now().isoformat(), "hbValue": req.hbValue, "status": status}
    if req.userId not in hb_db: hb_db[req.userId] = []
    hb_db[req.userId].insert(0, record)
    return {"message": "Saved", "record": record}

@app.get("/api/hb/{user_id}")
async def get_hb_history(user_id: str):
    return hb_db.get(user_id, [])

@app.get("/api/anemia-combo/{user_id}")
async def get_combo_report(user_id: str):
    history = hb_db.get(user_id, [])
    if not history: raise HTTPException(status_code=400, detail="No Hemoglobin data found. Please sync LunaClip first.")
    latest_hb = history[0]["hbValue"]
    
    if latest_hb < 10.0:
        return {"risk_level": "Critical", "is_anemic": True, "combined_insight": f"AI Engine detected a Critical Anemia Risk. Your live Hb is {latest_hb} g/dL. Immediate medical leave and consultation is required."}
    elif latest_hb < 12.0:
         return {"risk_level": "Moderate", "is_anemic": True, "combined_insight": f"Moderate Anemia Risk detected (Hb: {latest_hb} g/dL). Recommend adjusting diet."}
    else:
        return {"risk_level": "Low", "is_anemic": False, "combined_insight": f"Healthy Vitals (Hb: {latest_hb} g/dL). No correlation found between cycle logs and anemia."}

@app.get("/api/institute/leaves")
async def get_leaves(role: str):
    if role not in ["dept_head", "admin"]: raise HTTPException(status_code=403, detail="Access Denied.")
    return MOCK_LEAVES

@app.post("/api/institute/leaves")
async def submit_leave(req: LeaveSubmission):
    new_leave = {"id": len(MOCK_LEAVES) + 1, "studentId": req.student_id, "risk": req.risk_score, "hbLevel": req.hb_level, "status": "Pending", "reason": req.reason}
    MOCK_LEAVES.append(new_leave)
    return {"status": "success", "message": "Leave request submitted."}

@app.get("/api/institute/complaints")
async def get_complaints(role: str):
    if role not in ["admin", "state_govt", "central_govt"]: raise HTTPException(status_code=403, detail="Access Denied.")
    return MOCK_COMPLAINTS


# ---------------------------------------------------------
# 🌟 7. TWILIO WHATSAPP ALERT SYSTEM 🌟
# ---------------------------------------------------------
@app.post("/api/institute/trigger-alert")
async def trigger_health_alert(req: AlertRequest):
    if req.role not in ["dept_head", "admin"]:
        raise HTTPException(status_code=403, detail="Only Authorities can trigger alerts.")

    # Find student to get Guardian Phone Number
    student = next((u for u in MOCK_USERS.values() if u["id"] == req.student_id), None)
    if not student or not student.get("guardian_phone"):
        raise HTTPException(status_code=404, detail="Student's guardian phone number not found in database.")

    student_name = student["name"]
    guardian_phone = student["guardian_phone"]

    message_body = (
        f"🚨 *LunaFlow Institute Health Alert* 🚨\n\n"
        f"Dear Guardian / Medical Officer,\n\n"
        f"This is an automated alert regarding *{student_name}* (ID: {req.student_id}).\n\n"
        f"Our AI Cross-Analysis Engine has detected a *CRITICAL RISK* of Anemia correlated with recent physiological logs.\n\n"
        f"The Department Head has authorized this alert. Immediate medical consultation is highly recommended."
    )

    try:
        # 👇 To send REAL messages, replace these with your Twilio keys and uncomment the block
        # TWILIO_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
        # TWILIO_TOKEN = "your_auth_token_here"           
        # TWILIO_WHATSAPP_NUMBER = "whatsapp:+14155238886" 
        #
        # client = Client(TWILIO_SID, TWILIO_TOKEN)
        # message = client.messages.create(
        #     from_=TWILIO_WHATSAPP_NUMBER,
        #     body=message_body,
        #     to=guardian_phone
        # )
        
        # PROTOTYPE MOCK: Prints beautifully to your Python Terminal
        print("\n" + "="*60)
        print("📲 INITIATING AUTOMATED WHATSAPP MESSAGE")
        print("="*60)
        print(f"Target Number: {guardian_phone}")
        print(f"Payload Data:\n{message_body}")
        print("="*60 + "\n")

        return {"status": "success", "message": f"WhatsApp medical alert dispatched to {student_name}'s guardian."}
        
    except Exception as e:
        print("Twilio Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to connect to WhatsApp Gateway.")