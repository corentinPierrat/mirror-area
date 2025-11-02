import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.models import Workflow, WorkflowStep
from app.services.timer_utils import parse_interval_minutes
from app.services.workflows import trigger_workflows

logger = logging.getLogger(__name__)


class TimerWorkflowScheduler:
    def __init__(self, poll_interval: int = 15):
        self.poll_interval = max(1, poll_interval)
        self._task: asyncio.Task | None = None
        self._stop_event = asyncio.Event()
        self._next_run: Dict[int, datetime] = {}

    def start(self):
        if self._task and not self._task.done():
            return
        self._stop_event.clear()
        loop = asyncio.get_running_loop()
        self._task = loop.create_task(self._run(), name="timer-workflow-loop")

    async def shutdown(self):
        if not self._task:
            return
        self._stop_event.set()
        try:
            await self._task
        finally:
            self._task = None

    async def _run(self):
        while not self._stop_event.is_set():
            try:
                await self._tick()
            except Exception as exc:
                logger.exception("Timer scheduler tick failed: %s", exc)

            try:
                await asyncio.wait_for(self._stop_event.wait(), timeout=self.poll_interval)
            except asyncio.TimeoutError:
                continue

    async def _tick(self):
        db: Session = SessionLocal()
        try:
            steps = (
                db.query(WorkflowStep)
                .join(Workflow)
                .filter(
                    WorkflowStep.type == "action",
                    WorkflowStep.service == "timer",
                    Workflow.active == True,
                )
                .all()
            )

            active_step_ids = {step.id for step in steps}
            now = datetime.now(timezone.utc)
            for step_id in list(self._next_run.keys()):
                if step_id not in active_step_ids:
                    self._next_run.pop(step_id, None)
            for step in steps:
                params = dict(step.params or {})
                interval_minutes = parse_interval_minutes(params)
                if interval_minutes is None:
                    continue
                next_run = self._next_run.setdefault(step.id, now)
                if now < next_run:
                    continue
                payload = {
                    "step_id": step.id,
                    "workflow_id": step.workflow_id,
                    "triggered_at": now.isoformat(),
                    "interval_minutes": interval_minutes,
                    "interval_seconds": interval_minutes * 60,
                }
                if params:
                    payload["timer_params"] = params

                try:
                    await trigger_workflows("timer", step.event, payload, db)
                except Exception as exc:
                    logger.exception(
                        "Failed to trigger timer workflow %s (step %s): %s",
                        step.workflow_id,
                        step.id,
                        exc,
                    )
                finally:
                    self._next_run[step.id] = now + timedelta(minutes=interval_minutes)
        finally:
            db.close()

scheduler = TimerWorkflowScheduler()
