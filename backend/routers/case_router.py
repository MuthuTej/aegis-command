from fastapi import APIRouter, HTTPException
from services.autopsy_service import autopsy_service
from services.mock_generator import generate_mock_timeline, generate_mock_movement

router = APIRouter()

@router.get("/autopsies")
def get_autopsies(limit: int = 50, skip: int = 0):
    """
    Returns a list of autopsies from the dataset.
    """
    data = autopsy_service.get_all_autopsies(limit, skip)
    return {"data": data, "count": len(data)}

@router.get("/autopsy/{cpr_number}")
def get_autopsy(cpr_number: str):
    """
    Returns a specific autopsy by CPR Number.
    """
    record = autopsy_service.get_autopsy_by_cpr(cpr_number)
    if not record:
        raise HTTPException(status_code=404, detail="Autopsy not found")
    return record

@router.get("/cases/{case_id}/timeline")
def get_case_timeline(case_id: str):
    """
    Returns mocked time-series log events for the given case.
    """
    return {"case_id": case_id, "timeline": generate_mock_timeline(case_id)}

@router.get("/cases/{case_id}/movement")
def get_case_movement(case_id: str):
    """
    Returns mocked geospatial GPS routes.
    """
    return {"case_id": case_id, "movement": generate_mock_movement(case_id)}
