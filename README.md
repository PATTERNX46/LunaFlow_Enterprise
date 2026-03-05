# 🌙 LunaFlow & LunaClip 🩸
**An AI-Powered Women's Health & IoT Diagnostic Ecosystem**

LunaFlow revolutionizes women's health by fusing Machine Learning cycle tracking with physical IoT diagnostics. Paired seamlessly with **LunaClip**—our custom ESP32 wearable—via WebBLE, the system streams real-time, non-invasive hemoglobin vitals directly to the browser. By analyzing period history alongside live blood data, our Ensemble ML engine instantly detects hidden anemia and dysmenorrhea risks to deliver predictive, personalized care.

---

## ✨ Key Features
* **🤖 Ensemble ML Risk Assessment:** Predicts hidden health risks (e.g., Anemia) based on menstrual flow, pain levels, and cycle duration.
* **🩸 LunaClip IoT Integration:** Real-time Hemoglobin (Hb) monitoring via Photoplethysmography (PPG) and Web Bluetooth (WebBLE).
* **🧠 AI Wellness Plans:** Generates highly personalized regional diet charts, yoga routines, and health habits based on dynamic health scores.
* **📊 Interactive Dashboard:** Visualizes cycle trends, flow distribution, and a historical timeline of blood vitals.

---

## 🛠️ System Architecture & Methods Used

### 1. Hardware & Signal Processing (LunaClip)
* **Microcontroller & Sensor:** ESP32 DevKit V1 + MAX30102 Oximetry Sensor (I2C Protocol).
* **Photoplethysmography (PPG):** Analyzes blood volume changes using Red and Infrared (IR) LEDs.
* **Ratio of Ratios (Hb Index):** Separates AC (pulsatile) and DC (baseline) optical signals to estimate Hemoglobin:
$$Hb_{index} = \frac{Red_{AC} / Red_{DC}}{IR_{AC} / IR_{DC}}$$
* **WebBLE (Web Bluetooth):** Operates the ESP32 as a GATT Server, allowing the React frontend to connect directly to the hardware without a mobile app middleman.

### 2. Software Stack
* **Frontend:** React.js, TypeScript, Tailwind CSS, Recharts.
* **Backend:** Node.js, Express.js, MongoDB (Mongoose ODM).
* **ML Microservice:** Python, FastAPI, Uvicorn, Scikit-Learn.

---

## 🚀 Installation & Setup Guide

This project runs on three separate servers: the Node Backend, the Python ML Microservice, and the React Frontend. You will need 3 separate terminal windows open.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [Python 3.9+](https://www.python.org/downloads/) installed
* MongoDB connection URI (Atlas or Local)

### 1. Backend Setup (Node.js)
Open your first terminal and navigate to your backend folder:
```bash
# Install dependencies
npm install express mongoose cors dotenv axios

# Create a .env file and add your MongoDB URI
echo "MONGODB_URI=your_mongodb_connection_string_here" > .env

# Start the server
node server.js
Server will run on http://localhost:5000

2. ML Microservice Setup (Python FastAPI)
Open your second terminal and navigate to the ml_service folder:

Bash
# Windows: Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Mac/Linux: Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install required Python packages
pip install fastapi uvicorn scikit-learn pandas pydantic

# Run the FastAPI server
uvicorn main:app --reload
ML Service will run on http://127.0.0.1:8000

3. Frontend Setup (React/Vite)
Open your third terminal and navigate to the React frontend folder (Periods-tracker):

Bash
# Install standard dependencies
npm install

# Install Web Bluetooth types for TypeScript
npm install --save-dev @types/web-bluetooth

# Start the React development server
npm run dev
Frontend will run on http://localhost:5173

🔌 Hardware Setup (LunaClip)
1. Wiring:

MAX30102 VIN ➔ ESP32 3.3V

MAX30102 GND ➔ ESP32 GND

MAX30102 SDA ➔ ESP32 D21

MAX30102 SCL ➔ ESP32 D22

2. Arduino IDE Setup:

Install the ESP32 Board Manager by Espressif.

Go to Library Manager and install the SparkFun MAX3010x Pulse and Proximity Sensor Library.

3. Upload: * Select ESP32 Dev Module and upload the provided C++ code.

💡 How to Use the System
Launch all three local servers (Node, Python, React).

Open Google Chrome or Microsoft Edge (WebBLE is not supported in Firefox/Safari).

Navigate to http://localhost:5173 and log in.

Go to the Dashboard.

Ensure your ESP32 is powered on. Click Pair Device on the dashboard.

Select LunaClip from the browser popup.

Place your finger on the MAX30102 sensor. Your live Hemoglobin vitals will appear on screen! Click Save Reading to log it to your medical history.

Go to AI Analysis to generate a holistic wellness report combining your period data and new blood vitals.

