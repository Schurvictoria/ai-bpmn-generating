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
from config import secret_key, database_url, openai_api_key

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])


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

    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    })

@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]
  
    user = User.query.filter_by(email=email).first()
  
    if user is None:
        return jsonify({"error": "Unauthorized Access"}), 401
  
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401

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
            "\n</format>"},
            {"role": "user", "content": user_input}
        ]

        response = client.chat.completions.create(
            model="gpt-4", 
            messages=messages,
        )

        descriped_process_response = response.choices[0].message.content.strip()

        if not descriped_process_response:
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
            {"role": "system", "content": "You are a BPMN process analyst. Read the BPMN 2.0 XML and describe the business process in plain language."},
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


if __name__ == "__main__":
    app.run(debug=True)
