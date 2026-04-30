import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# 1. Load the dataset
df = pd.read_csv('anemia.csv')

# 2. Separate Features (X) and Target (y)
# Features: Gender, Hemoglobin, MCH, MCHC, MCV
X = df[['Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV']]
y = df['Result']

# 3. Train a highly accurate Random Forest Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 4. Save the trained model to a file
with open('anemia_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Anemia ML Model trained and saved successfully as anemia_model.pkl!")