from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from app.api.deps import get_db, require_role
from app.models.user import User, RoleEnum
from app.models.patient import Patient

router = APIRouter(prefix="/api/patients", tags=["Patients"])

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    diagnosis_stage: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    diagnosis_stage: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("/", response_model=PatientResponse)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.CAREGIVER.value, RoleEnum.FAMILY_CONTRIBUTOR.value]))
):
    """
    Creates a new patient profile and links it to the current caregiver/contributor.
    """
    # Create the patient
    patient = Patient(
        first_name=patient_in.first_name,
        last_name=patient_in.last_name,
        date_of_birth=patient_in.date_of_birth,
        diagnosis_stage=patient_in.diagnosis_stage
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Link to current user
    current_user.patient_id = patient.id
    db.commit()

    return patient

@router.get("/", response_model=List[PatientResponse])
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.CAREGIVER.value, RoleEnum.FAMILY_CONTRIBUTOR.value, RoleEnum.PATIENT.value]))
):
    """
    Returns the list of patients the user has access to. 
    Currently limited to 1 patient per account.
    """
    if current_user.patient_id is None:
        return []
    
    patient = db.query(Patient).filter(Patient.id == current_user.patient_id).first()
    if patient:
        return [patient]
    
    return []

import random
import string

class InviteCodeResponse(BaseModel):
    invite_code: str

@router.post("/{patient_id}/invite-code", response_model=InviteCodeResponse)
def generate_invite_code(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.CAREGIVER.value]))
):
    """
    Generates a unique 6-character invite code for a patient.
    """
    if current_user.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this patient")
        
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Generate a random 6-character uppercase alphanumeric code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    patient.invite_code = code
    db.commit()
    
    return {"invite_code": code}

@router.get("/{patient_id}/invite-code", response_model=InviteCodeResponse)
def get_invite_code(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.CAREGIVER.value]))
):
    """
    Gets the current invite code for a patient.
    """
    if current_user.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this patient")
        
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return {"invite_code": patient.invite_code or ""}

class JoinRequest(BaseModel):
    invite_code: str

@router.post("/join", response_model=PatientResponse)
def join_care_circle(
    req: JoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FAMILY_CONTRIBUTOR.value, RoleEnum.CAREGIVER.value]))
):
    """
    Allows a user to join a patient's care circle using an invite code.
    """
    if not req.invite_code:
        raise HTTPException(status_code=400, detail="Invite code is required")
        
    patient = db.query(Patient).filter(Patient.invite_code == req.invite_code).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Invalid invite code")
        
    current_user.patient_id = patient.id
    db.commit()
    
    return patient

