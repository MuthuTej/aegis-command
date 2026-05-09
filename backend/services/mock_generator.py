import random
from datetime import datetime, timedelta

def generate_mock_timeline(case_id: str):
    """
    Generates a list of mock timeline events (logs) leading up to a crime.
    """
    base_time = datetime.now().replace(hour=18, minute=0, second=0, microsecond=0)
    
    events = [
        {
            "id": 1,
            "time": (base_time + timedelta(minutes=10)).strftime("%H:%M"),
            "title": "Victim leaves home",
            "eventType": "movement",
            "description": "Victim departs Triplicane residence on foot.",
            "confidence": 92,
            "severity": "normal",
            "aiInsight": "Normal movement pattern detected."
        },
        {
            "id": 2,
            "time": (base_time + timedelta(hours=1, minutes=42)).strftime("%H:%M"),
            "title": "UPI Transfer to Suspect",
            "eventType": "financial",
            "description": "₹40,000 transferred from victim to S-118",
            "confidence": 88,
            "severity": "suspicious",
            "aiInsight": "Financial link established 90 min before TOD."
        },
        {
            "id": 3,
            "time": (base_time + timedelta(hours=2, minutes=14)).strftime("%H:%M"),
            "title": "CCTV Spots Victim",
            "eventType": "cctv",
            "description": "Victim captured at Chennai Central E-Gate 4.",
            "confidence": 95,
            "severity": "normal",
            "aiInsight": "Timestamp verified. Consistent trajectory."
        },
        {
            "id": 4,
            "time": (base_time + timedelta(hours=2, minutes=22)).strftime("%H:%M"),
            "title": "Phone Tower Overlap",
            "eventType": "phone",
            "description": "Victim and S-118 phones on same cell tower.",
            "confidence": 81,
            "severity": "critical",
            "aiInsight": "Proximity confirmed within 500m radius."
        }
    ]
    
    return events

def generate_mock_movement(case_id: str):
    """
    Generates mock GPS routes for victim and suspects.
    """
    return [
        { "lat": 13.0560, "lng": 80.2620, "t": "18:10", "who": "victim", "action": "Departed Triplicane residence" },
        { "lat": 13.0820, "lng": 80.2730, "t": "20:14", "who": "victim", "action": "Spotted at Chennai Central E-Gate 4" },
        { "lat": 13.0825, "lng": 80.2750, "t": "20:42", "who": "victim", "action": "CCTV captures altercation" },
        { "lat": 13.0900, "lng": 80.2800, "t": "20:55", "who": "suspect-1", "action": "Fled scene towards North Chennai" },
        { "lat": 13.0825, "lng": 80.2750, "t": "20:42", "who": "suspect-1", "action": "Present at altercation site" },
        { "lat": 13.0700, "lng": 80.2700, "t": "21:25", "who": "suspect-1", "action": "Phone tower pings near Egmore" },
        { "lat": 13.0650, "lng": 80.2650, "t": "19:00", "who": "suspect-2", "action": "Waiting at cafe" },
        { "lat": 13.0750, "lng": 80.2700, "t": "20:10", "who": "suspect-2", "action": "Moving towards Central Station" },
        { "lat": 13.0825, "lng": 80.2750, "t": "20:42", "who": "suspect-2", "action": "Present at altercation site" },
    ]
