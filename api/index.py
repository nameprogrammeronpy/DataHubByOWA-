from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import json
import os
import google.generativeai as genai
from pathlib import Path

# Настройка Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

# Определяем базовый путь
BASE_DIR = Path(__file__).resolve().parent.parent

# Подключаем статику и шаблоны
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.mount("/preview", StaticFiles(directory=str(BASE_DIR / "data" / "PREVIEW")), name="preview")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Загрузка данных университетов
def load_universities():
    json_path = BASE_DIR / "data" / "universities.json"
    with open(json_path, "r", encoding="utf-8-sig") as f:
        return json.load(f)

universities_data = load_universities()

class CompareRequest(BaseModel):
    university_ids: list

class ChatRequest(BaseModel):
    message: str

class CareerTestRequest(BaseModel):
    answers: list

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "universities": universities_data.get("universities", [])
    })

@app.get("/compare", response_class=HTMLResponse)
async def compare_page(request: Request):
    return templates.TemplateResponse("compare.html", {
        "request": request,
        "universities": universities_data.get("universities", [])
    })

@app.get("/career-test", response_class=HTMLResponse)
async def career_test_page(request: Request):
    return templates.TemplateResponse("career_test.html", {"request": request})

@app.get("/faq", response_class=HTMLResponse)
async def faq_page(request: Request):
    return templates.TemplateResponse("faq.html", {"request": request})

@app.get("/university/{uni_id}", response_class=HTMLResponse)
async def university_page(request: Request, uni_id: int):
    university = None
    for uni in universities_data.get("universities", []):
        if uni.get("id") == uni_id:
            university = uni
            break
    if not university:
        return templates.TemplateResponse("404.html", {"request": request}, status_code=404)
    return templates.TemplateResponse("university.html", {
        "request": request,
        "university": university
    })

@app.post("/api/compare")
async def compare_universities(data: CompareRequest):
    selected = []
    for uni in universities_data.get("universities", []):
        if uni.get("id") in data.university_ids:
            selected.append(uni)
    return {"universities": selected}

@app.post("/api/chat")
async def chat(data: ChatRequest):
    try:
        if not GEMINI_API_KEY:
            return {"response": "API ключ не настроен"}

        model = genai.GenerativeModel('gemini-1.5-flash')

        universities_context = json.dumps(universities_data.get("universities", [])[:10], ensure_ascii=False, indent=2)

        prompt = f"""Ты - помощник по выбору университета в Казахстане. 
        
Вот данные о некоторых университетах:
{universities_context}

Вопрос пользователя: {data.message}

Ответь кратко и по делу на русском языке."""

        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Ошибка: {str(e)}"}

@app.post("/api/career-test/analyze")
async def analyze_career_test(data: CareerTestRequest):
    try:
        if not GEMINI_API_KEY:
            return {"analysis": "API ключ не настроен", "recommended_universities": []}

        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = f"""На основе ответов теста профориентации: {data.answers}
        
Проанализируй склонности и порекомендуй направления обучения. Ответь на русском кратко."""

        response = model.generate_content(prompt)

        return {
            "analysis": response.text,
            "recommended_universities": universities_data.get("universities", [])[:5]
        }
    except Exception as e:
        return {"analysis": f"Ошибка: {str(e)}", "recommended_universities": []}

@app.get("/api/universities")
async def get_universities():
    return universities_data

# Для Vercel
handler = app

