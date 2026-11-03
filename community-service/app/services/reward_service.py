from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.module_reward import ModuleReward
from app.schemas.reward import (
    BadgeResponse,
    ModuleCompletedData,
    StudentAchievementsResponse,
)


def grant_module_reward(
    db: Session,
    data: ModuleCompletedData,
) -> tuple[ModuleReward, bool]:
    reward = ModuleReward(
        estudiante_id=data.estudiante_id,
        modulo_id=data.modulo_id,
        puntos=10,
        insignia=f"MODULO_{data.modulo_id}_COMPLETADO",
    )

    try:
        db.add(reward)
        db.flush()
        db.refresh(reward)
        db.commit()

        return reward, True

    except IntegrityError:
        db.rollback()

        existing = db.scalar(
            select(ModuleReward).where(
                ModuleReward.estudiante_id == data.estudiante_id,
                ModuleReward.modulo_id == data.modulo_id,
            )
        )

        if existing is None:
            raise

        return existing, False

    except SQLAlchemyError:
        db.rollback()
        raise


def get_total_points(db: Session, estudiante_id: str) -> int:
    statement = select(
        func.coalesce(func.sum(ModuleReward.puntos), 0)
    ).where(
        ModuleReward.estudiante_id == estudiante_id
    )

    return db.execute(statement).scalar_one()

def get_student_achievements(
    db: Session,
    estudiante_id: str,
) -> StudentAchievementsResponse:
    statement = (
        select(ModuleReward)
        .where(ModuleReward.estudiante_id == estudiante_id)
        .order_by(
            ModuleReward.otorgada_en.desc(),
            ModuleReward.id.desc(),
        )
    )

    rewards = db.scalars(statement).all()

    return StudentAchievementsResponse(
        estudiante_id=estudiante_id,
        puntos_totales=sum(reward.puntos for reward in rewards),
        insignias=[
            BadgeResponse.model_validate(reward)
            for reward in rewards
        ],
    )
