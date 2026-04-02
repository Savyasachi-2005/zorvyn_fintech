from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from dependencies.role_checker import RoleChecker
from models.user import UserRole
from schemas.audit_log import AuditLogPublic
from services.audit_service import get_audit_logs

router = APIRouter(prefix="/admin", tags=["Admin"])
admin_only = RoleChecker([UserRole.ADMIN])


@router.get("/logs", response_model=list[AuditLogPublic], dependencies=[Depends(admin_only)])
def list_audit_logs(db: Session = Depends(get_db)):
    return get_audit_logs(db)
