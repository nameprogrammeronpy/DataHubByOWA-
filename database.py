import sqlite3
import hashlib
import os
from datetime import datetime

DATABASE = "data/datahub.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Инициализация базы данных"""
    os.makedirs("data", exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # Таблица пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            ent_score INTEGER,
            iin TEXT,
            documents_uploaded INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Таблица заявок
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            university_id INTEGER NOT NULL,
            university_name TEXT NOT NULL,
            program TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            full_name TEXT,
            email TEXT,
            phone TEXT,
            ent_score INTEGER,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """Хэширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username: str, password: str):
    """Создание нового пользователя"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, hash_password(password))
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {"success": True, "user_id": user_id}
    except sqlite3.IntegrityError:
        conn.close()
        return {"success": False, "error": "Пользователь уже существует"}

def authenticate_user(username: str, password: str):
    """Аутентификация пользователя"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password_hash = ?",
        (username, hash_password(password))
    )
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"success": True, "user": dict(user)}
    return {"success": False, "error": "Неверный логин или пароль"}

def get_user_by_id(user_id: int):
    """Получение пользователя по ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def update_user_profile(user_id: int, data: dict):
    """Обновление профиля пользователя"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users 
        SET full_name = ?, email = ?, phone = ?, ent_score = ?, iin = ?
        WHERE id = ?
    ''', (data.get('full_name'), data.get('email'), data.get('phone'),
          data.get('ent_score'), data.get('iin'), user_id))
    conn.commit()
    conn.close()
    return {"success": True}

def create_application(user_id: int, data: dict):
    """Создание заявки на поступление"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO applications 
        (user_id, university_id, university_name, program, full_name, email, phone, ent_score, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, data['university_id'], data['university_name'], data['program'],
          data['full_name'], data['email'], data['phone'], data.get('ent_score'), data.get('message')))
    conn.commit()
    app_id = cursor.lastrowid
    conn.close()
    return {"success": True, "application_id": app_id}

def get_user_applications(user_id: int):
    """Получение заявок пользователя"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    )
    apps = cursor.fetchall()
    conn.close()
    return [dict(app) for app in apps]

def get_application_by_id(app_id: int, user_id: int):
    """Получение заявки по ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM applications WHERE id = ? AND user_id = ?",
        (app_id, user_id)
    )
    app = cursor.fetchone()
    conn.close()
    return dict(app) if app else None

def update_application(app_id: int, user_id: int, data: dict):
    """Обновление заявки"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE applications 
        SET program = ?, full_name = ?, email = ?, phone = ?, ent_score = ?, message = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
    ''', (data['program'], data['full_name'], data['email'], data['phone'],
          data.get('ent_score'), data.get('message'), datetime.now(), app_id, user_id))
    conn.commit()
    conn.close()
    return {"success": True}

def withdraw_application(app_id: int, user_id: int):
    """Отзыв заявки"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE applications SET status = 'withdrawn', updated_at = ? WHERE id = ? AND user_id = ?",
        (datetime.now(), app_id, user_id)
    )
    conn.commit()
    conn.close()
    return {"success": True}

def delete_application(app_id: int, user_id: int):
    """Удаление заявки"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM applications WHERE id = ? AND user_id = ?",
        (app_id, user_id)
    )
    conn.commit()
    conn.close()
    return {"success": True}

# Инициализация БД при импорте
init_db()

