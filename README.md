# ai-bpmn-generating

# 🧩 BPMN Diagram Generator

Веб-сервис, который по текстовому описанию бизнес-процесса генерирует BPMN-диаграмму.  
Backend — Flask (Python), Frontend — React (JavaScript).

## 📸 Скриншоты


> 📁 Скриншоты хранятся в папке `screenshots/`. Добавь свои скриншоты!

---

## 🚀 Быстрый запуск

### 📦 Клонируй репозиторий

```bash
git clone git@github.com:Schurvictoria/ai-bpmn-generating.git
cd bpmn-diagram-generator
```

🐍 Backend (Flask)
1. Установи зависимости

Создай виртуальное окружение и установи зависимости:
```
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
```

2. Настрой config.py в папке backendс параметрами почты, базы данных и т.д.

```
from flask import Flask, jsonify

secret_key  = '{твои данные}'
database_url = 'sqlite:///flaskdb.db'
openai_api_key = "{ключ open AI api}"
email_json = {
    'MAIL_SERVER': '{твой адрес}',
    'MAIL_PORT': 587,
    'MAIL_USE_TLS': True,
    'MAIL_USERNAME': '{почта}',
    'MAIL_PASSWORD': '{пароль},
    'MAIL_DEFAULT_SENDER': '{твой адрес}'
}
````

3. Запусти сервер

```
flask run
```

По умолчанию откроется на http://localhost:5000

🌐 Frontend (React)

Перейди в директорию client/ (если ты хранишь фронт отдельно)
```
cd client
npm install
npm start
```
Откроется на http://localhost:3000

⚙️ Стек технологий

Backend: Python 3.12 + Flask 3.1
Frontend: JavaScript (React 18)
Mail: Flask-Mail (для отправки писем)

📩 Контакты

Разработчик: Щур Виктория Олеговна
Почта: hello@victoriaschur.ru
Telegram: @schurvictoria
