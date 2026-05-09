# Time of Death (PMI) Prediction System

This project contains a simple and clean machine learning pipeline and a FastAPI backend to predict the Time of Death (Postmortem Interval - PMI) in hours based on a forensic dataset.

## Project Structure
- `train_model.py`: Script to process the forensic dataset, synthetically generate the target variable `PMI_hours`, train a RandomForestRegressor model, and save it.
- `schemas.py`: Contains Pydantic models for request validation and response formatting.
- `main.py`: The FastAPI application that exposes the prediction and training endpoints.
- `requirements.txt`: Python dependencies.
- `pmi_model.pkl`: The trained machine learning model (generated after running `train_model.py`).

## Requirements
To install the required packages, run:
```bash
pip install -r requirements.txt
```

## How to Run

### 1. Train the Model
Before running the API, you must train the model so that `pmi_model.pkl` is generated.
Ensure `forensic_autopsy_3000.csv` is in the same directory.
```bash
python train_model.py
```
This script will:
- Load the 12 relevant forensic features.
- Generate `PMI_hours` based on forensic correlations (e.g., lower temperature = higher PMI, fixed livor mortis = higher PMI).
- Build a robust preprocessing pipeline (imputing missing values, scaling, one-hot encoding).
- Train the model and report the R² score.

### 2. Start the API Server
Start the FastAPI server using Uvicorn:
```bash
uvicorn main:app --reload
```
The server will run at `http://127.0.0.1:8000`.

### 3. Test the API
You can test the endpoints using the interactive Swagger UI built into FastAPI:
- Open your browser and go to: `http://127.0.0.1:8000/docs`

**Endpoints available:**
- **POST `/predict`**: Submit a JSON payload containing the 12 forensic features. Returns the predicted `PMI_hours`, a confidence score, and a feature importance explanation.
- **POST `/train`**: Triggers a background task to retrain the model on the CSV and reload it into memory.

## Example Prediction Payload
```json
{
  "Age": 45,
  "Height": 175.0,
  "Weight": 80.0,
  "Putrefaction": 0,
  "Algor Mortis": 22.5,
  "Vitreous Potassium": 7.5,
  "Sex": "Male",
  "Putre_level": "Mild",
  "Rigor Mortis": "Developing",
  "Livor Mortis": "Fixed (dependent areas)",
  "Stomach Contents": "Empty",
  "Entomology": "No insects present"
}
```
