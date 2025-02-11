from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import joblib
import json
from io import StringIO
import numpy as np
import os
from pages.api.tips import tips_router

# Load the saved model and preprocessing objects
gb_model = joblib.load('models/gb_model.pkl')
scaler = joblib.load('models/scaler.pkl')
label_encoders = joblib.load('models/label_encoders.pkl')

app = FastAPI()

# Add CORS middleware to allow requests from your frontend
origins = [
    "http://localhost:3000",  # Allow your Next.js frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins if required
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(tips_router)

# Define the column name mapping (from Typeform to model)
column_mapping = {
    "What is your age?": "Age",
    "Where do you live?": "Location",
    "What best describes your diet?": "DietType",
    "How often do you consume locally sourced food?": "LocalFoodFrequency",
    "What is your primary mode of transportation?": "TransportationMode",
    "What is the primary source of energy used in your home?": "EnergySource",
    "What type of home do you live in?": "HomeType",
    "What is the approximate size of your home (in square feet)?": "HomeSize",
    "How often do you purchase new clothing?": "ClothingFrequency",
    "Do you prioritize purchasing from sustainable brands?": "SustainableBrands",
    "How would you rate your environmental awareness?": "EnvironmentalAwareness",
    "How involved are you in community activities or initiatives?": "CommunityInvolvement",
    "What is your average monthly electricity consumption (in kilowatt-hours)?": "MonthlyElectricityConsumption",
    "What is your average monthly water consumption (in gallons)?": "MonthlyWaterConsumption",
    "What is your gender?": "Gender",
    "How often do you use plastic products?": "UsingPlasticProducts",
    "What is your primary method of waste disposal?": "DisposalMethods",
    "What is your level of physical activity?": "PhysicalActivities"
}

@app.get("/submission")
async def get_submission():
    try:
        # Define the correct path to 'submissions.json'
        file_path = os.path.join(os.getcwd(), 'submissions.json')
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                data = json.load(file)
        else:
            return {"error": "submissions.json file not found"}

        if len(data) == 0:
            return {"error": "No submissions found"}

        # Get the latest submission (last in the list)
        latest_submission = data[-1]
        return latest_submission  # Return the latest submission as JSON

    except Exception as e:
        return {"error": str(e)}

@app.get("/predict")
async def predict():
    try:
        # Define the correct path to 'submissions.json' in the root directory of the project
        file_path = os.path.join(os.getcwd(), 'submissions.json')

        # Debugging: Check if the file path is correct
        print(f"Looking for submissions.json at: {file_path}")

        # Open the 'submissions.json' file
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                data = json.load(file)
            print(f"Loaded data: {data}")  # This should print the loaded JSON data
        else:
            return {"error": "submissions.json file not found"}

        # Get the most recent submission
        if len(data) == 0:
            return {"error": "No submissions found"}

        latest_submission = data[-1]  # Get the latest submission (last in the list)

        # Debugging: Print the latest submission to confirm
        print(f"Latest submission: {latest_submission}")

        # Get the answers from the latest submission
        answers = latest_submission["answers"]

        # Ensure the length of answers matches the expected number of columns
        if len(answers) != len(column_mapping):
            return {"error": "Mismatch between number of answers and expected columns."}

        # Create a dictionary of column names and corresponding answers
        submission_data = {column_mapping[key]: [answers[i]] for i, key in enumerate(column_mapping)}

        # Convert to DataFrame
        df = pd.DataFrame(submission_data)

        # Ensure that the columns match the model's expected feature names
        model_features = list(column_mapping.values())
        df = df[model_features]

        # Apply label encoding to categorical columns
        for column in ['Location', 'DietType', 'LocalFoodFrequency', 'TransportationMode', 'EnergySource',
                       'HomeType', 'ClothingFrequency', 'SustainableBrands', 'CommunityInvolvement', 'Gender',
                       'UsingPlasticProducts', 'DisposalMethods', 'PhysicalActivities']:
            df[column] = label_encoders[column].transform(df[column])

        # Scale numerical features using the scaler
        numerical_columns = ['Age', 'HomeSize', 'MonthlyElectricityConsumption', 'MonthlyWaterConsumption', 'EnvironmentalAwareness']
        df[numerical_columns] = scaler.transform(df[numerical_columns])

        # Predict using the pre-loaded model
        predicted_rating = gb_model.predict(df)

        # Return the predicted sustainability rating
        return {"predicted_rating": predicted_rating[0]}

    except Exception as e:
        print(f"Error: {e}")  # Log any error
        return {"error": str(e)}