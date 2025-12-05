from fastapi import FastAPI, Request, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
import database as db

load_dotenv()

# Конфигурация Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

app = FastAPI(title="DataHub ВУЗ-ов РК", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статика и шаблоны
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
templates = Jinja2Templates(directory="templates")

# Загрузка данных университетов
def load_universities():
    with open("data/universities.json", "r", encoding="utf-8") as f:
        return json.load(f)

universities_data = load_universities()

# Модели
class ChatMessage(BaseModel):
    message: str

class CompareRequest(BaseModel):
    university_ids: list[int]

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    ent_score: Optional[int] = None
    iin: Optional[str] = None

class ApplicationCreate(BaseModel):
    university_id: int
    university_name: str
    program: str
    full_name: str
    email: str
    phone: str
    ent_score: Optional[int] = None
    message: Optional[str] = None

class ApplicationUpdate(BaseModel):
    program: str
    full_name: str
    email: str
    phone: str
    ent_score: Optional[int] = None
    message: Optional[str] = None

# Системный промпт для бота
SYSTEM_PROMPT = """Ты — дружелюбный и умный AI-консультант платформы "DataHub ВУЗ-ов РК". 
Твоя задача — помогать абитуриентам и студентам выбирать университеты в Казахстане.

Вот данные об университетах, которые ты знаешь:
{universities_info}

Правила:
1. Отвечай на русском языке, дружелюбно и информативно
2. Если спрашивают о конкретном университете — дай подробную информацию
3. Если нужно сравнить университеты — сравни по ключевым параметрам
4. Рекомендуй университеты на основе интересов, баллов ЕНТ и бюджета пользователя
5. Если не знаешь ответ — честно скажи об этом
6. Используй эмодзи для большей выразительности 🎓
7. Давай краткие, но полезные ответы
"""

def get_universities_info():
    """Подготовка информации о ВУЗах для контекста AI"""
    info = []
    for uni in universities_data["universities"]:
        info.append(f"""
        - {uni['name_ru']} ({uni['city']})
          Тип: {uni['focus']}, Рейтинг: {uni['rating']}
          Стоимость бакалавриата: {uni['tuition_kzt_year']:,} тг/год
          Мин. балл ЕНТ: {uni['ent_min_score']}
          Программы: {', '.join(uni['programs_bachelor'][:5])}...
        """)
    return "\n".join(info)

# Роуты
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "universities": universities_data["universities"]
    })

@app.get("/university/{uni_id}", response_class=HTMLResponse)
async def university_detail(request: Request, uni_id: int):
    university = next((u for u in universities_data["universities"] if u["id"] == uni_id), None)
    if not university:
        return templates.TemplateResponse("404.html", {"request": request}, status_code=404)
    return templates.TemplateResponse("university.html", {
        "request": request,
        "university": university
    })

@app.get("/compare", response_class=HTMLResponse)
async def compare_page(request: Request):
    return templates.TemplateResponse("compare.html", {
        "request": request,
        "universities": universities_data["universities"]
    })

@app.get("/faq", response_class=HTMLResponse)
async def faq_page(request: Request):
    return templates.TemplateResponse("faq.html", {"request": request})

@app.get("/api/universities")
async def get_universities():
    return universities_data

@app.get("/api/universities/{uni_id}")
async def get_university(uni_id: int):
    university = next((u for u in universities_data["universities"] if u["id"] == uni_id), None)
    return university if university else {"error": "University not found"}

@app.post("/api/chat")
async def chat_with_ai(chat: ChatMessage):
    try:
        # Формируем промпт с контекстом
        full_prompt = SYSTEM_PROMPT.format(universities_info=get_universities_info())

        # Создаём чат
        chat_session = model.start_chat(history=[
            {"role": "user", "parts": [full_prompt]},
            {"role": "model", "parts": ["Понял! Я готов помогать абитуриентам с выбором университета в Казахстане. Чем могу помочь? 🎓"]}
        ])

        # Отправляем сообщение пользователя
        response = chat_session.send_message(chat.message)

        return {"response": response.text}
    except Exception as e:
        return {"response": f"Извините, произошла ошибка: {str(e)}. Попробуйте позже."}

@app.post("/api/compare")
async def compare_universities(request: CompareRequest):
    selected = [u for u in universities_data["universities"] if u["id"] in request.university_ids]
    return {"universities": selected}

# ===== AUTH ROUTES =====
@app.post("/api/auth/register")
async def register(user: UserRegister):
    result = db.create_user(user.username, user.password)
    return result

@app.post("/api/auth/login")
async def login(user: UserLogin):
    result = db.authenticate_user(user.username, user.password)
    return result

@app.get("/api/user/{user_id}")
async def get_user(user_id: int):
    user = db.get_user_by_id(user_id)
    if user:
        user.pop('password_hash', None)
        return {"success": True, "user": user}
    return {"success": False, "error": "Пользователь не найден"}

@app.put("/api/user/{user_id}/profile")
async def update_profile(user_id: int, profile: UserProfile):
    result = db.update_user_profile(user_id, profile.dict())
    return result

# ===== APPLICATION ROUTES =====
@app.post("/api/applications")
async def create_application(user_id: int, app: ApplicationCreate):
    result = db.create_application(user_id, app.dict())
    return result

@app.get("/api/applications/{user_id}")
async def get_applications(user_id: int):
    apps = db.get_user_applications(user_id)
    return {"success": True, "applications": apps}

@app.get("/api/application/{app_id}")
async def get_application(app_id: int, user_id: int):
    app = db.get_application_by_id(app_id, user_id)
    if app:
        return {"success": True, "application": app}
    return {"success": False, "error": "Заявка не найдена"}

@app.put("/api/application/{app_id}")
async def update_application(app_id: int, user_id: int, app: ApplicationUpdate):
    result = db.update_application(app_id, user_id, app.dict())
    return result

@app.post("/api/application/{app_id}/withdraw")
async def withdraw_application(app_id: int, user_id: int):
    result = db.withdraw_application(app_id, user_id)
    return result

@app.delete("/api/application/{app_id}")
async def delete_application(app_id: int, user_id: int):
    result = db.delete_application(app_id, user_id)
    return result

# ===== PAGE ROUTES =====
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
