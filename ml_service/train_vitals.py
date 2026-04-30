# train_vitals.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# 1. Load the generated dataset
df = pd.read_csv("advanced_vitals_dataset.csv")

# 2. Features (X) and Labels (y)
X = df[["Hb", "SpO2", "HR"]]
y = df["Risk_Label"]

# 3. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"🎯 Advanced Vitals AI Model Trained! Accuracy: {accuracy * 100:.2f}%")

# 5. Save the model
with open("vitals_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("✅ Model saved as vitals_model.pkl")