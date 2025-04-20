# backend/app.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
import sqlite3
import datetime
import os
import json

app = FastAPI(title="Codex of Forgotten Paths API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_PATH = "codex.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character TEXT,
        quest TEXT,
        timestamp TEXT
    )
    ''')
    conn.commit()
    conn.close()

init_db()

# Simple response for ping
@app.get("/ping")
async def ping():
    return {"message": "pong"}

# Submit a quest
@app.post("/submit")
async def submit_quest(request: Request):
    try:
        data = await request.json()
        character = data.get("character", "Anonymous")
        quest = data.get("quest", "")
        
        if not quest:
            return JSONResponse(content={"error": "No quest text provided"}, status_code=400)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO quests (character, quest, timestamp) VALUES (?, ?, ?)",
            (
                character,
                quest,
                datetime.datetime.now().isoformat()
            )
        )
        conn.commit()
        conn.close()
        
        return {"success": True}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Get all quests
@app.get("/quests")
async def get_quests_json():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quests ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    quests = [dict(row) for row in rows]
    return quests

# HTML view for quests (for simplicity)
@app.get("/", response_class=HTMLResponse)
async def get_quests_html():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quests ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    quests = [dict(row) for row in rows]
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Codex of Forgotten Paths</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            h1 { color: #333; text-align: center; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .quest { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .quest-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .character { font-weight: bold; color: #4a6fa5; }
            .timestamp { color: #888; font-size: 0.9em; }
            .quest-text { white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Codex of Forgotten Paths</h1>
    """
    
    for quest in quests:
        html += f"""
            <div class="quest">
                <div class="quest-header">
                    <span class="character">{quest['character']}</span>
                    <span class="timestamp">{quest['timestamp']}</span>
                </div>
                <div class="quest-text">{quest['quest']}</div>
            </div>
        """
    
    html += """
        </div>
    </body>
    </html>
    """
    
    return html

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
