from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, date
from collections import defaultdict


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    period_type: Literal["week", "month", "custom"]
    start_date: str  # ISO format date string
    end_date: str    # ISO format date string
    measure_type: Literal["full_days", "hours"]
    target_value: float
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GoalCreate(BaseModel):
    name: str
    period_type: Literal["week", "month", "custom"]
    start_date: str
    end_date: str
    measure_type: Literal["full_days", "hours"]
    target_value: float

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    period_type: Optional[Literal["week", "month", "custom"]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    measure_type: Optional[Literal["full_days", "hours"]] = None
    target_value: Optional[float] = None

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal_id: str
    date: str  # ISO format date string
    value: float  # количество дней или часов
    note: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProgressCreate(BaseModel):
    goal_id: str
    date: str
    value: float
    note: Optional[str] = None

class ProgressUpdate(BaseModel):
    goal_id: Optional[str] = None
    date: Optional[str] = None
    value: Optional[float] = None
    note: Optional[str] = None

class GoalSummary(BaseModel):
    goal: Goal
    completed: float
    remaining: float
    percentage: float
    progress_entries: List[Progress]


# Goal endpoints
@api_router.post("/goals", response_model=Goal)
async def create_goal(input: GoalCreate):
    goal_obj = Goal(**input.model_dump())
    doc = goal_obj.model_dump()
    await db.goals.insert_one(doc)
    return goal_obj

@api_router.get("/goals", response_model=List[Goal])
async def get_goals():
    goals = await db.goals.find({}, {"_id": 0}).to_list(1000)
    return goals

@api_router.get("/goals/{goal_id}", response_model=Goal)
async def get_goal(goal_id: str):
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: str, input: GoalUpdate):
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.goals.update_one({"id": goal_id}, {"$set": update_data})
    
    updated_goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return updated_goal

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str):
    result = await db.goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Also delete all progress entries for this goal
    await db.progress.delete_many({"goal_id": goal_id})
    
    return {"message": "Goal deleted successfully"}


# Progress endpoints
@api_router.post("/progress", response_model=Progress)
async def create_progress(input: ProgressCreate):
    # Check if goal exists
    goal = await db.goals.find_one({"id": input.goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    progress_obj = Progress(**input.model_dump())
    doc = progress_obj.model_dump()
    await db.progress.insert_one(doc)
    return progress_obj

@api_router.get("/progress", response_model=List[Progress])
async def get_progress(goal_id: Optional[str] = None):
    query = {"goal_id": goal_id} if goal_id else {}
    progress_list = await db.progress.find(query, {"_id": 0}).to_list(1000)
    return progress_list

@api_router.get("/progress/{progress_id}", response_model=Progress)
async def get_progress_entry(progress_id: str):
    progress = await db.progress.find_one({"id": progress_id}, {"_id": 0})
    if not progress:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    return progress

@api_router.put("/progress/{progress_id}", response_model=Progress)
async def update_progress(progress_id: str, input: ProgressUpdate):
    progress = await db.progress.find_one({"id": progress_id}, {"_id": 0})
    if not progress:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.progress.update_one({"id": progress_id}, {"$set": update_data})
    
    updated_progress = await db.progress.find_one({"id": progress_id}, {"_id": 0})
    return updated_progress

@api_router.delete("/progress/{progress_id}")
async def delete_progress(progress_id: str):
    result = await db.progress.delete_one({"id": progress_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    return {"message": "Progress entry deleted successfully"}


# Summary endpoint
@api_router.get("/summary", response_model=List[GoalSummary])
async def get_summary():
    goals = await db.goals.find({}, {"_id": 0}).to_list(1000)
    summaries = []
    
    for goal in goals:
        progress_list = await db.progress.find({"goal_id": goal["id"]}, {"_id": 0}).to_list(1000)
        
        completed = sum(p["value"] for p in progress_list)
        remaining = max(0, goal["target_value"] - completed)
        percentage = (completed / goal["target_value"] * 100) if goal["target_value"] > 0 else 0
        
        summaries.append(GoalSummary(
            goal=Goal(**goal),
            completed=completed,
            remaining=remaining,
            percentage=min(100, percentage),
            progress_entries=[Progress(**p) for p in progress_list]
        ))
    
    return summaries


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()