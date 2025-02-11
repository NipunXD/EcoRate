import os
import json
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from typing import List

from dotenv import load_dotenv
load_dotenv()  # This loads the environment variables from .env

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Generation config for consistent outputs
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

# Initialize the model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Create the router
tips_router = APIRouter()

# Define the questions in order (should match the order in column_mapping)
QUESTIONS = [
    "What is your age?",
    "Where do you live?",
    "What best describes your diet?",
    "How often do you consume locally sourced food?",
    "What is your primary mode of transportation?",
    "What is the primary source of energy used in your home?",
    "What type of home do you live in?",
    "What is the approximate size of your home (in square feet)?",
    "How often do you purchase new clothing?",
    "Do you prioritize purchasing from sustainable brands?",
    "How would you rate your environmental awareness?",
    "How involved are you in community activities or initiatives?",
    "What is your average monthly electricity consumption (in kilowatt-hours)?",
    "What is your average monthly water consumption (in gallons)?",
    "What is your gender?",
    "How often do you use plastic products?",
    "What is your primary method of waste disposal?",
    "What is your level of physical activity?"
]

def generate_sustainability_tips(answers: List[str]) -> str:
    """
    Generate sustainability tips based on submission answers
    """
    # Create a formatted string of Q&A pairs
    qa_pairs = []
    for q, a in zip(QUESTIONS, answers):
        qa_pairs.append(f"{q}: {a}")
    formatted_answers = "\n".join(qa_pairs)

    # Initialize chat with context
    chat = model.start_chat(history=[
        {
            "role": "user",
            "parts": ["""You are a sustainability advisor. Provide tips in a STRICTLY STRUCTURED format.

Response MUST follow this EXACT template:
```
**Transportation**
- Specific actionable tip about transportation
- Another transportation-related tip

**Energy Efficiency**
- Specific actionable tip about energy usage
- Another energy-related tip

**Water Consumption**
- Specific actionable tip about water conservation
- Another water-related tip

**Waste Management**
- Specific actionable tip about reducing waste
- Another waste management tip

**Food and Diet**
- Specific actionable tip about sustainable eating
- Another food-related tip

**Clothing**
- Specific actionable tip about sustainable fashion
- Another clothing-related tip
```

REQUIREMENTS:
- Use bullet points
- Focus on personalized, actionable tips
- Base recommendations on the specific answers provided
- Keep tips concise but meaningful
- Avoid generic advice
- Ensure tips directly relate to the user's responses
"""]
        }
    ])

    # Get tips based on the submission
    try:
        response = chat.send_message(
            f"""Based on these questionnaire answers, provide personalized sustainability tips:

            {formatted_answers}

            Generate tips following the EXACT template specified previously."""
        )
        return response.text
    except Exception as e:
        return f"Error generating tips: {str(e)}"

@tips_router.get("/tips")
async def get_sustainability_tips():
    """
    Endpoint to generate sustainability tips based on the latest submission
    """
    try:
        # Define the correct path to 'submissions.json'
        file_path = os.path.join(os.getcwd(), 'submissions.json')
        
        # Open the 'submissions.json' file
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="submissions.json file not found")

        with open(file_path, 'r') as file:
            data = json.load(file)

        # Get the most recent submission
        if len(data) == 0:
            raise HTTPException(status_code=404, detail="No submissions found")

        latest_submission = data[-1]  # Get the latest submission (last in the list)
        
        # Extract answers from the submission
        answers = latest_submission.get("answers", [])

        # Validate the number of answers
        if len(answers) != len(QUESTIONS):
            raise HTTPException(status_code=400, detail=f"Expected {len(QUESTIONS)} answers, but got {len(answers)}")

        # Generate sustainability tips
        tips = generate_sustainability_tips(answers)
        print(tips)
        return {"tips": tips}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))