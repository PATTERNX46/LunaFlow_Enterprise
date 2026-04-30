# generate_vitals.py
import pandas as pd
import numpy as np
import random

data = []
# Generating 1000 synthetic patient records for Hackathon
for _ in range(1000):
    condition = random.choice(["Normal", "Anemia", "Sleep Apnea", "Cardiovascular Stress", "Panic Attack", "Viral Infection"])
    
    if condition == "Normal":
        hb = round(random.uniform(12.5, 16.0), 1)
        spo2 = random.randint(96, 100)
        hr = random.randint(60, 85)
    elif condition == "Anemia":
        hb = round(random.uniform(8.0, 11.5), 1)
        spo2 = random.randint(95, 100)
        hr = random.randint(70, 95)
    elif condition == "Sleep Apnea":
        hb = round(random.uniform(12.0, 16.0), 1)
        spo2 = random.randint(85, 91) # Low SpO2
        hr = random.randint(95, 110) # Spiked HR
    elif condition == "Cardiovascular Stress":
        hb = round(random.uniform(12.0, 16.0), 1)
        spo2 = random.randint(95, 100)
        hr = random.randint(105, 130) # High resting HR
    elif condition == "Panic Attack":
        hb = round(random.uniform(12.0, 16.0), 1)
        spo2 = random.randint(97, 100)
        hr = random.randint(115, 140) # Very high HR, normal oxygen
    elif condition == "Viral Infection":
        hb = round(random.uniform(11.5, 15.0), 1)
        spo2 = random.randint(92, 94) # Slight oxygen drop
        hr = random.randint(90, 105) # Elevated HR
        
    data.append([hb, spo2, hr, condition])

df = pd.DataFrame(data, columns=["Hb", "SpO2", "HR", "Risk_Label"])
df.to_csv("vitals_dataset.csv", index=False)
print("✅ vitals_dataset.csv generated successfully with 1000 records!")