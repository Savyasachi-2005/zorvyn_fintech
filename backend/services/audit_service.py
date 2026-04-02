from typing import Optional

from sqlalchemy.orm import Session

from models.audit_log import AuditLog
from schemas.audit_log import AuditLogPublic


def log_action(
    db: Session,
    action: str,
    performed_by: int,
    target_user: Optional[int] = None,
    record_id: Optional[int] = None,
) -> None:
    """Create an audit log entry."""
    entry = AuditLog(
        action=action,
        performed_by=performed_by,
        target_user=target_user,
        record_id=record_id,
    )
    db.add(entry)
    db.commit()


def get_audit_logs(db: Session) -> list[AuditLogPublic]:
    """Return all audit logs sorted by latest, with performer/target names."""
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )
    results: list[AuditLogPublic] = []
    for log in logs:
        results.append(
            AuditLogPublic(
                id=log.id,
                action=log.action,
                performed_by=log.performed_by,
                performed_by_name=log.performer.full_name if log.performer else None,
                target_user=log.target_user,
                target_user_name=log.target.full_name if log.target else None,
                record_id=log.record_id,
                timestamp=log.timestamp,
            )
        )
    return results
