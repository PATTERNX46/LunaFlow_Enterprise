from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import joblib
import pandas as pd  
import pickle        
from twilio.rest import Client # 🌟 Twilio Integration

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
# 2. LOAD ANEMIA MODEL
# ---------------------------------------------------------
try:
    with open('anemia_model.pkl', 'rb') as f:
        anemia_model = pickle.load(f)
except Exception as e:
    print(f"Error loading anemia model: {e}")
    anemia_model = None

# ---------------------------------------------------------
# 🌟 LOAD NEW ADVANCED VITALS MODEL (Hackathon Feature) 🌟
# ---------------------------------------------------------
try:
    with open('vitals_model.pkl', 'rb') as f:
        vitals_model = pickle.load(f)
    print("✅ Advanced Vitals Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Advanced Vitals Model not found (Please generate it first): {e}")
    vitals_model = None


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

# 🌟 UPDATED: Added hrValue and spo2Value to accept data from LunaClip
class HbSaveRequest(BaseModel):
    userId: str
    hbValue: float
    hrValue: Optional[float] = None
    spo2Value: Optional[float] = None

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

# 🌟 UPDATED: Saving Hb, HR, and SpO2 into the database 🌟
@app.post("/api/hb/save")
async def save_hb(req: HbSaveRequest):
    status = "Normal"
    if req.hbValue < 11.0: status = "Low (Anemic Risk)"
    if req.hbValue > 15.0: status = "High"
    
    # Safely handle potential nulls from frontend
    hr_val = req.hrValue if req.hrValue else 75.0
    spo2_val = req.spo2Value if req.spo2Value else 98.0
    
    record = {
        "date": datetime.now().isoformat(), 
        "hbValue": req.hbValue, 
        "hrValue": hr_val,
        "spo2Value": spo2_val,
        "status": status
    }
    
    if req.userId not in hb_db: hb_db[req.userId] = []
    hb_db[req.userId].insert(0, record)
    return {"message": "Saved", "record": record}

@app.get("/api/hb/{user_id}")
async def get_hb_history(user_id: str):
    return hb_db.get(user_id, [])


# =====================================================================
# 🌟 UPDATED: SMART MERGE AI ENGINE (Anemia + Advanced Vitals) 🌟
# =====================================================================
@app.get("/api/anemia-combo/{user_id}")
async def get_combo_report(user_id: str):
    history = hb_db.get(user_id, [])
    if not history: 
        raise HTTPException(status_code=400, detail="No vitals data found. Please sync LunaClip first.")
    
    latest_vitals = history[0]
    latest_hb = latest_vitals["hbValue"]
    latest_spo2 = latest_vitals.get("spo2Value", 98)
    latest_hr = latest_vitals.get("hrValue", 75)

    # Base response structure
    final_response = {
        "risk_level": "Low",
        "is_anemic": False,
        "combined_insight": ""
    }

    # 1. PRIMARY PREDICTION: Anemia Check
    if anemia_model:
        try:
            # Assuming average features for demonstration, since we lack deep menstrual logs in this dict
            features_df = pd.DataFrame([[1, latest_hb, 28.0, 33.0, 85.0]], columns=['Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV'])
            is_anemic = bool(anemia_model.predict(features_df)[0] == 1)
            
            if is_anemic:
                final_response["risk_level"] = "High"
                final_response["is_anemic"] = True
                final_response["combined_insight"] = f"⚠️ ML detects Clinical Anemia (Live Hb: {latest_hb} g/dL). This indicates your anemia is likely dietary or related to menstrual blood loss."
            else:
                final_response["combined_insight"] = f"✅ Optimal Health. Your Hemoglobin ({latest_hb} g/dL) is normal."
        except Exception as e:
            print(f"Anemia ML error: {e}")
            final_response["combined_insight"] = f"Processed Hemoglobin data (Hb: {latest_hb} g/dL)."
    else:
        # Fallback if Anemia ML model is missing
        if latest_hb < 11.0:
            final_response["risk_level"] = "High"
            final_response["is_anemic"] = True
            final_response["combined_insight"] = f"⚠️ Critical Anemia Risk detected (Live Hb: {latest_hb} g/dL)."
        else:
            final_response["combined_insight"] = f"✅ Healthy Vitals (Hb: {latest_hb} g/dL)."

    # 2. SECONDARY PREDICTION: Advanced Vitals (Sleep Apnea, Anxiety, etc.)
    if vitals_model:
        try:
            prediction = vitals_model.predict([[latest_hb, latest_spo2, latest_hr]])[0]
            
            vitals_risk = "Low"
            vitals_insight = ""
            
            if prediction == "Sleep Apnea":
                vitals_risk = "Critical"
                vitals_insight = f"🚨 HYPOXIA RISK: Severe SpO2 drop ({latest_spo2}%) combined with high Heart Rate ({latest_hr} BPM) suggests acute respiratory distress or Sleep Apnea."
            elif prediction == "Panic Attack":
                vitals_risk = "High"
                vitals_insight = f"🧠 ANXIETY ALERT: Sudden Heart Rate spike ({latest_hr} BPM) with normal oxygen ({latest_spo2}%) suggests an acute stress response. Please try the 4-7-8 breathing exercise."
            elif prediction == "Viral Infection":
                vitals_risk = "Moderate"
                vitals_insight = f"🤒 VIRAL PRECURSOR: Subtle oxygen drop ({latest_spo2}%) and elevated resting HR ({latest_hr} BPM) often precede viral fevers (like Dengue) by 48 hours."
            elif prediction == "Cardiovascular Stress":
                vitals_risk = "High"
                vitals_insight = f"🫀 TACHYCARDIA: Resting Heart Rate is unusually high ({latest_hr} BPM). High risk of cardiovascular stress or severe dehydration."
            
            # If the advanced vitals found a risk, merge it with the original anemia report
            if vitals_risk != "Low":
                # Upgrade the overall risk level if the vitals risk is higher
                if vitals_risk == "Critical":
                    final_response["risk_level"] = "Critical"
                elif vitals_risk == "High" and final_response["risk_level"] != "Critical":
                    final_response["risk_level"] = "High"
                
                # Append the new insight
                final_response["combined_insight"] += f"\n\n🔸 ADVANCED VITALS SCAN: {vitals_insight}"

        except Exception as e:
            print(f"Error making prediction with vitals model: {e}")
            pass

    return final_response


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