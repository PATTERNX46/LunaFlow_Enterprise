# 🌙 LunaFlow & LunaClip 
**Explainable Menstrual Pattern Analysis & Early Health Risk Awareness**
LunaFlow eradicates the "Silent Epidemic" of Iron Deficiency Anemia. We combined a non-invasive biometric wearable (LunaClip) with an Explainable AI engine. By merging live physical vitals (Hb, SpO2) with menstrual logs, we provide proactive health alerts, data-backed medical leave requests, and comprehensive clinical reports for women.



[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=flat&logo=espressif&logoColor=white)](https://www.espressif.com/)

> *Current menstrual trackers are just digital calendars. Clinical blood tests are invasive and painful. We built the world's first ecosystem combining IoT hardware and Explainable AI to bridge the gap between subjective cycle logging and clinical diagnostics.*

---

## 📖 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Hardware Architecture (LunaClip)](#-hardware-architecture-lunaclip)
- [Software & AI Architecture (LunaFlow)](#-software--ai-architecture-lunaflow)
- [Tech Stack](#-tech-stack)
- [How It Works (User Journey)](#-how-it-works)
- [Installation & Setup](#-installation--setup)
- [Future Roadmap](#-future-roadmap)

---

## 🚨 The Problem: The "Silent Epidemic"
Globally, millions of women suffer from **Iron Deficiency Anemia** directly linked to heavy menstrual bleeding (Menorrhagia). However, current solutions fail because:
1. **Subjective Data:** Period tracking apps rely on users guessing their flow intensity, which isn't enough for a medical diagnosis.
2. **Invasive Testing:** Getting actual blood vitals requires painful, infrequent needle pricks.
3. **The AI "Black Box":** Even when AI is used in healthcare, it rarely explains *why* a risk is flagged, leading to a lack of trust from both patients and doctors.
4. **Institutional Stigma:** Women lack a data-backed, transparent way to request medical leaves or report grievances in schools and workplaces.

---

## 💡 Our Solution: The Luna Ecosystem
**LunaFlow** (Software) and **LunaClip** (IoT Hardware) create a seamless, end-to-end women's health platform. 

We use a low-cost optical sensor to painlessly extract physical blood vitals and cross-analyze them with the user's logged menstrual data using an **Explainable AI (XAI)** engine. This predicts hidden health risks early, generates actionable wellness plans, and empowers women with undeniable physiological proof of their symptoms.

---

## ✨ Key Features

* **🩸 Non-Invasive Vitals:** Painless, real-time Hemoglobin (Hb), Blood Oxygen (SpO2), and Heart Rate (BPM) tracking via optical sensors.
* **🧠 Explainable AI:** Our Machine Learning model cross-analyzes live physical vitals with logged symptoms to predict Anemia, explicitly stating the reasoning behind the risk score.
* **🥗 Actionable Wellness:** Generates hyper-localized diet charts, yoga routines, and healthy habit recommendations based on the AI vitality score.
* **🏢 Institutional Equity:** A 5-tier role-based enterprise portal (User → Dept Head → Admin → State Govt → Central Govt) for data-backed medical leaves and secure, image-supported grievance reporting.
* **📄 Automated Clinical Reports:** 1-click generation of comprehensive PDF medical reports to eliminate "medical gaslighting" at the doctor's office.

---

## ⚙️ Hardware Architecture (LunaClip)
LunaClip is a low-cost, non-invasive wearable clip that measures critical blood vitals using photoplethysmography (PPG).

* **Components:** ESP32 Microcontroller + MAX30102 Oximetry Sensor.
* **The Math:** Uses the **'Ratio of Ratios'** algorithm to extract Red and Infrared AC/DC values to calculate Hb and SpO2.
* **Signal Filtration:** To prevent motion artifacts (noise from movement), the C++ firmware calculates the **Perfusion Index (PI)** locally. It rejects flatlines or spikes *before* transmitting data to the web.
* **Driverless Integration:** Connects directly to the React web browser via the **Web Serial API** (`navigator.serial`). No Bluetooth pairing or external driver installations are required.

---

## 💻 Software & AI Architecture (LunaFlow)
LunaFlow is the central hub for data visualization, AI prediction, and enterprise management.

* **Real-Time Console:** Features a live, auto-scrolling terminal inside the React dashboard. Users can watch the hardware actively scan and sync JSON vital packets in real-time.
* **Cross-Analysis ML Engine:** Built with Python (FastAPI/Scikit-learn). It receives mixed payloads (e.g., "Heavy Flow" from the DB + "10.2 g/dL Hb" from the hardware) to generate holistic risk assessments.
* **Dynamic Visualizations:** Utilizes `Recharts` to plot historical cycle trends, duration, and flow intensity distributions over time.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (TypeScript)
* Tailwind CSS
* Recharts (Data Visualization)
* jsPDF & autoTable (Report Generation)
* Lucide React (Icons)

**Backend & Database:**
* Node.js & Express.js
* MongoDB & Mongoose (ODM)
* Python & FastAPI (Machine Learning Microservice)

**Hardware / IoT:**
* ESP32 Microcontroller
* C++ (Arduino Framework)
* Web Serial API (Browser-to-Hardware communication)

---

## 🚀 How It Works (The User Journey)

1. **Log Data:** The user logs their recent menstrual cycle details (duration, flow intensity, pain level) in the LunaFlow web app.
2. **Scan Vitals:** The user connects the LunaClip via USB, clicks "Connect," and places their finger on the sensor. Live Hb, SpO2, and HR stream into the dashboard terminal.
3. **Cross-Analyze:** The user clicks "Generate Cross-Report." The system sends both the cycle logs and the physical vitals to the Python AI engine.
4. **Get Insights:** The AI returns an explainable risk assessment (e.g., "High Risk of Anemia detected due to low Hb compounded by heavy bleeding") along with personalized diet and yoga plans.
5. **Export & Act:** The user exports a PDF report for their doctor or uses their Vitality Score to apply for an institutional medical leave.

---

## 💻 Installation & Setup

### Prerequisites
* Node.js (v16+)
* Python (v3.8+)
* MongoDB (Local or Atlas URI)
* Arduino IDE (for ESP32 hardware)

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/LunaFlow.git](https://github.com/YOUR_USERNAME/LunaFlow.git)
cd LunaFlow
2. Setup the Node.js Backend
Bash
cd backend
npm install
# Create a .env file and add your MONGODB_URI
# Start the server (runs on port 5000)
node server.js
3. Setup the Python ML Service
Bash
cd ../ml_service
pip install -r requirements.txt
# Start the FastAPI server (runs on port 8000)
uvicorn main:app --reload
4. Setup the React Frontend
Bash
cd ../frontend
npm install
# Start the development server (runs on port 3000)
npm start
5. Flash the Hardware (Optional)
Open hardware/LunaClip_V3.ino in the Arduino IDE.

Install the MAX30105 library via the Library Manager.

Select your ESP32 board and COM port.

Upload the code.

🔮 Future Roadmap
LunaRing: Miniaturizing the hardware into a continuous-wear smart ring for 24/7 passive anomaly detection.

Advanced AI Diagnostics: Training models to predict complex conditions like PCOS and Endometriosis using Basal Body Temperature variations.

Direct Telemedicine: Adding a secure portal to forward AI-generated PDF reports directly to partnered gynecologists.

Offline PWA: Implementing Progressive Web App features and vernacular languages (Hindi, Bengali) for rural accessibility.