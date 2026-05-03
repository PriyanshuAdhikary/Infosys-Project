from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'taskmanager_db')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ Auth Setup & RBAC ============
SECRET_KEY = "infosys-super-secret-key"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Hardcoded users to bypass a full registration flow for the deadline
USERS_DB = {
    "vanshika": {"username": "vanshika", "password": "demo123", "role": "Admin"},
    "maya": {"username": "maya", "password": "demo123", "role": "Admin"},
    "diego": {"username": "diego", "password": "demo123", "role": "Member"}
}

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
        return {"username": username, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ Models ============
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    token: str
    username: str
    role: Literal['Admin', 'Member']

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    color: str = "indigo"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    name: str
    color: Optional[str] = "indigo"

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    project_id: str
    project_name: str
    assigned_to: str
    assignee_avatar: Optional[str] = ""
    due_date: str
    status: Literal['Pending', 'In Progress', 'Completed'] = 'Pending'
    priority: Literal['Low', 'Medium', 'High'] = 'Medium'
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    project_id: str
    assigned_to: str
    assignee_avatar: Optional[str] = ""
    due_date: str
    priority: Optional[Literal['Low', 'Medium', 'High']] = 'Medium'

class TaskStatusUpdate(BaseModel):
    status: Literal['Pending', 'In Progress', 'Completed']

# ============ Routes ============
@api_router.get("/")
async def root():
    return {"message": "TaskSync API"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = USERS_DB.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # Generate real JWT token
    expiration = datetime.now(timezone.utc) + timedelta(hours=2)
    token = jwt.encode(
        {"sub": user["username"], "role": user["role"], "exp": expiration},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return LoginResponse(
        access_token=token, 
        token_type="bearer", 
        token=token, 
        username=user["username"], 
        role=user["role"]
    )

@api_router.get("/projects", response_model=List[Project])
async def list_projects(current_user: dict = Depends(get_current_user)):
    projects = await db.projects.find({}, {"_id": 0}).to_list(500)
    return projects

@api_router.post("/projects", response_model=Project)
async def create_project(payload: ProjectCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can create projects")
    
    project = Project(name=payload.name, color=payload.color or "indigo")
    await db.projects.insert_one(project.model_dump())
    return project

@api_router.get("/tasks", response_model=List[Task])
async def list_tasks(current_user: dict = Depends(get_current_user)):
    # Members see all tasks in this dashboard view, but can only be assigned specific ones
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/tasks", response_model=Task)
async def create_task(payload: TaskCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can assign tasks")
        
    project = await db.projects.find_one({"id": payload.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    task = Task(
        title=payload.title,
        description=payload.description or "",
        project_id=payload.project_id,
        project_name=project["name"],
        assigned_to=payload.assigned_to,
        assignee_avatar=payload.assignee_avatar or "",
        due_date=payload.due_date,
        priority=payload.priority or "Medium",
    )
    await db.tasks.insert_one(task.model_dump())
    return task

@api_router.patch("/tasks/{task_id}", response_model=Task)
async def update_task_status(task_id: str, payload: TaskStatusUpdate, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.update_one(
        {"id": task_id}, {"$set": {"status": payload.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return task

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can delete tasks")
        
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}

# ============ Seed ============
@app.on_event("startup")
async def seed_data():
    try:
        projects_count = await db.projects.count_documents({})
        if projects_count == 0:
            seeds = [
                Project(name="Atlas Web Platform", color="indigo"),
                Project(name="Orion Mobile App", color="emerald"),
                Project(name="Helios Dashboard", color="amber"),
            ]
            await db.projects.insert_many([p.model_dump() for p in seeds])

        tasks_count = await db.tasks.count_documents({})
        if tasks_count == 0:
            projects = await db.projects.find({}, {"_id": 0}).to_list(10)
            by_name = {p["name"]: p for p in projects}
            now = datetime.now(timezone.utc)

            def due(days):
                return (now + timedelta(days=days)).date().isoformat()

            avatars = [
                "https://images.unsplash.com/photo-1768247695726-022586dea3a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhciUyMGhlYWRzaG90fGVufDB8fHx8MTc3NzgwMTIyMHww&ixlib=rb-4.1.0&q=85",
                "https://images.unsplash.com/photo-1609371497456-3a55a205d5eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhciUyMGhlYWRzaG90fGVufDB8fHx8MTc3NzgwMTIyMHww&ixlib=rb-4.1.0&q=85",
                "https://images.pexels.com/photos/14589344/pexels-photo-14589344.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            ]

            seed_tasks = [
                ("Design onboarding flow", "Atlas Web Platform", "Vanshika", avatars[0], due(2), "Pending", "High"),
                ("Implement OAuth provider", "Atlas Web Platform", "Diego Rivera", avatars[2], due(5), "In Progress", "High"),
                ("Write API documentation", "Atlas Web Platform", "Priya Nair", avatars[1], due(7), "Pending", "Medium"),
                ("Refactor push notifications", "Orion Mobile App", "Diego Rivera", avatars[2], due(-1), "In Progress", "High"),
                ("Add offline sync", "Orion Mobile App", "Vanshika", avatars[0], due(10), "Pending", "Medium"),
                ("Ship analytics charts", "Helios Dashboard", "Priya Nair", avatars[1], due(3), "Completed", "Low"),
                ("Build export CSV feature", "Helios Dashboard", "Vanshika", avatars[0], due(4), "Completed", "Medium"),
                ("Optimize dashboard load time", "Helios Dashboard", "Diego Rivera", avatars[2], due(8), "In Progress", "High"),
            ]
            tasks = []
            for title, proj_name, assignee, avatar, d, status, priority in seed_tasks:
                proj = by_name[proj_name]
                tasks.append(
                    Task(
                        title=title,
                        project_id=proj["id"],
                        project_name=proj["name"],
                        assigned_to=assignee,
                        assignee_avatar=avatar,
                        due_date=d,
                        status=status,
                        priority=priority,
                    ).model_dump()
                )
            await db.tasks.insert_many(tasks)
    except Exception as e:
        logging.exception("Seeding failed: %s", e)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your local and live frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()