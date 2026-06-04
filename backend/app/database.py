import asyncio
from sqlalchemy import create_engine, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

sync_engine = create_engine(settings.database_url.replace("+aiosqlite", ""))
sync_session = Session(sync_engine)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Base.metadata.create_all(sync_engine)  # sync creation removed; async engine handles migrations


def run_async(coro):
    return asyncio.run(coro)


def update_task(task_id: str, **kwargs):
    from app.models.task import Task

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop is None:
        with Session(sync_engine) as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if task is None:
                return
            for key, value in kwargs.items():
                setattr(task, key, value)
            session.commit()
        return

    async def _update():
        async with async_session() as session:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()
            if task is None:
                return
            for key, value in kwargs.items():
                setattr(task, key, value)
            await session.commit()

    run_async(_update())
