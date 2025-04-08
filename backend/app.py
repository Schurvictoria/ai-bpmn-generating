from openai import OpenAI
import openai
from flask import Flask, jsonify, request, session, redirect
import requests
from requests.auth import HTTPProxyAuth
from itsdangerous import URLSafeTimedSerializer
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User
import os
from config import secret_key, database_url, openai_api_key, email_json
from flask_mail import Mail, Message
#from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)


app.config['SECRET_KEY'] = secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])

app.config.update(email_json)
mail = Mail(app)

#migrate = Migrate(app, db)

bcrypt = Bcrypt(app)
db.init_app(app)

with app.app_context():
    db.create_all()


client = OpenAI (
    api_key = openai_api_key
)   

from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = serializer.loads(token, max_age=3600)
            user = User.query.get(data["user_id"])
            if not user:
                return jsonify({"error": "Invalid user"}), 401
            request.user = user
        except Exception as e:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated_function


@app.route("/", methods=['POST'])
def home_page():
    if "user_id" in session:
        return redirect("/")
    return redirect("/login")

@app.route("/signup", methods=["POST"])
def signup():
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({"error": "Email already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id

    token = serializer.dumps(email, salt='email-confirm')

    # Ссылка для подтверждения
    confirm_url = f"http://localhost:3000/confirm/{token}"
    html = f'<p>Привет! Подтверди свою почту: <a href="{confirm_url}">{confirm_url}</a></p>'

    # Отправка письма
    msg = Message("Подтверждение регистрации", recipients=[email], html=html)
    mail.send(msg)

    return jsonify({"message": "Письмо с подтверждением отправлено!"}), 200

    # return jsonify({
    #     "id": new_user.id,
    #     "email": new_user.email
    # })

from flask import redirect

@app.route("/confirm/<token>", methods=["GET"])
def confirm_email(token):
    try:
        email = serializer.loads(token, salt='email-confirm', max_age=3600)
    except Exception:
        return jsonify({"message": "fail"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "fail"}), 400

    if user.is_confirmed:
        return jsonify({"message": "Почта уже подтверждена"}), 200

    user.is_confirmed = 1
    db.session.commit()
    return jsonify({"message": "Email подтверждён!"}), 200



@app.route("/resend-email", methods=["POST"])
def resend_email():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.is_confirmed:
        return jsonify({"message": "Email already confirmed"}), 400

    token = serializer.dumps(email, salt="email-confirm")

    confirm_url = f"http://localhost:3000/confirm-email?token={token}&email={email}"

    msg = Message(
        subject="Confirm your email",
        recipients=[email],
        body=f"Please confirm your email by clicking on the link: {confirm_url}"
    )

    try:
        mail.send(msg)
        return jsonify({"message": "Confirmation email resent"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]
  
    user = User.query.filter_by(email=email).first()
  
    if user is None:
        return jsonify({"error": "Unauthorized Access"}), 401
  
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401

    if not user.is_confirmed:
        return jsonify({"error": "Email not confirmed"}), 403
    
    session["user_id"] = user.id

    token = serializer.dumps({"user_id": user.id, "email": user.email})
  
    return jsonify({
        "id": user.id,
        "email": user.email,
        "token": token
    })

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Вы вышли из системы"}), 200

@app.route("/current-user", methods=["GET"])
def current_user():
    user_id = session.get("user_id")

    if user_id is None:
        return jsonify({"error": "User not logged in"}), 401

    user = User.query.get(user_id)
    if user:
        return jsonify({"email": user.email})
    else:
        return jsonify({"error": "User not found"}), 404

@app.route("/ask", methods=["POST"])
def ask_ai():
    user_input = request.json.get("query") 

    if not user_input:
        return jsonify({"error": "No query provided"}), 400

    try:
        messages = [
            {"role": "system", "content": "Describe to me a BPMN process from user. write it down in a format like below"+
             "\n<format>"+
             "\nProcess Name: Order Processing"+
            "\nStart Event: “Order Received”"+
            "\nTask: Process Order”"+   
            "\nGateway: “Is Stock Available?”"+
            "\nif Yes:"+    
            "\nTask: “Pack Order”"+
            "\nTask: “Ship Order”"+
            "\nEnd Event: “Order Shipped”"+
            "\nif No:"+
            "\nTask: “Notify Customer:”"+
            "\nEnd Event: “Order Delayed”"+
            "\n</format>"#}, +
             "\n.If the user's input does not describe a business process (e.g., it's a personal statement, a question unrelated to processes, etc.), respond with 'Empty process'"},
            {"role": "user", "content": user_input}
        ]

        response = client.chat.completions.create(
            model="gpt-4", 
            messages=messages,
        )

        descriped_process_response = response.choices[0].message.content.strip()

        if not descriped_process_response or descriped_process_response == "Empty process":
            return jsonify({"error": "Described process is empty"}), 400
        
        messages = [
            {f"role": "user", "content": "Do you know BPMN 2.0 xml? as a specified on this website? https://www.omg.org/spec/BPMN/2.0/"+
            "Do a crawl of the site and underlaying documents and then load how make a BPMN xml into your memory"+
             "After that,"+
             "Create A BPMN XML flow of the process described below between  <process>...</process>"+
             "Make sure to user the right namespaces, prefixes" +
            "definitions("
            "xmlns:tns=http://bpmn.io/schema/bpmn"+
            "xmlns:activiti:http://activiti.org/bpmn)"+
            f"and BPMNDI elements. Send just a XML without without any explanation for this process: <process>{descriped_process_response}</process>"},

        ]

        response = client.chat.completions.create( 
            model="o1", 
            messages=messages,
        )
        result = response.choices[0].message.content.strip()
        return jsonify({"response": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

from werkzeug.utils import secure_filename
import xml.etree.ElementTree as ET

@app.route("/describe-bpmn", methods=["POST"])
def describe_bpmn():
    if "bpmn_file" not in request.files:
        return jsonify({"error": "No BPMN file uploaded"}), 400

    file = request.files["bpmn_file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    xml_content = file.read().decode("utf-8")

    try:
        messages = [
            {"role": "system", "content": "You are a BPMN process analyst. Read the BPMN 2.0 XML and describe the business process in plain language. "},
            {"role": "user", "content": f"Here is the BPMN XML:\n\n{xml_content}"}
        ]

        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )

        description = response.choices[0].message.content.strip()
        return jsonify({"description": description})

    except Exception as e:
        return jsonify({"error": f"Failed to process BPMN: {str(e)}"}), 500

@app.route("/edit-bpmn", methods=["POST"])
def edit_bpmn():
    try:
        if "bpmn_file" in request.files:
            file = request.files["bpmn_file"]
            xml_content = file.read().decode("utf-8")

            messages = [
                {"role": "system", "content": "You are a BPMN expert. Read this BPMN 2.0 XML and propose improvements to optimize, simplify, or clarify the process. Return only the edited BPMN XML with proper formatting and namespaces."},
                {"role": "user", "content": xml_content}
            ]
        else:
            user_input = request.json.get("query")
            if not user_input:
                return jsonify({"error": "No input provided"}), 400

            messages = [
                {"role": "system", "content": "You are a BPMN process designer. Generate a BPMN 2.0 XML process based on the description, and apply potential improvements, optimizations, or clarify ambiguous parts. Respond only with the resulting BPMN XML."},
                {"role": "user", "content": user_input}
            ]

        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )

        updated_bpmn = response.choices[0].message.content.strip()
        return jsonify({"edited_bpmn": updated_bpmn})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
