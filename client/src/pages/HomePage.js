import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'styles/HomePage.css';
import { ReactComponent as PlaneIcon } from 'styles/Icons/Union.svg';
import Header from 'modules/Header'

// TO-DO
// Защита от запросов, которые не касаются бизнес процессов
// Возможность обращаться к апишке не из зарубежа
// Улучшить дизайн фичи bpmn to text
// Добавить описание процесса
// Третью фичу добавить
// Хост
// Комменты нормальные сделать в коде
// Адаптивность добавить
// Причесать стили

const Dashboard = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [chatEnabled, setChatEnabled] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/logout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                localStorage.removeItem("userEmail");
                navigate("/login");
            } else {
                console.error("Ошибка логаута:", response.statusText);
            }
        } catch (error) {
            console.error("Ошибка при логауте:", error);
        }
    };

    const handleCardClick = () => {
      navigate("/chat");
  };

  const handleBPMNtoTextClick = () => {
    navigate("/describe-bpmn");
};
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (email) {
            setUserEmail(email);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="dashboard">
            {/* <div className="sidebar">
                <button onClick={handleLogout}><LogoutIcon width="24" height="24" /></button>
                <p>{userEmail || "Загрузка..."}</p>
            </div> */}
            <div>
                <Header />
            </div>
            <div className="main-content">
                <h1>Flowify – AI Powered Business Modeling</h1>
                <p>Hello, welcome to Flowify! Here you can generate BPMN diagrams from text requests, convert .bpmn files into readable text for your clients and team, and effortlessly edit your processes.</p>
            </div>

            <div className="container">
                <div className="process-card"><button onClick={handleCardClick}><h3>📊 New process</h3><p>Generate your new process easily!</p></button></div>
                <div className="process-card"><button onClick={handleBPMNtoTextClick}><h3>📝 BPMN to text</h3><p>Convert your bpmn file into text!</p></button></div>
                <div className="process-card"><button onClick={handleCardClick}><h3>✏️ Edit process</h3><p>Edit your process</p></button></div>
            </div>

            {/* Чат — всегда отображается, но заблокирован по умолчанию */}
            <div className="chat-window">
                <div className="chat-input"><p>To get started, simply click on your goal and begin!</p></div>
                <div className="chat-input">
                    <input 
                        type="text" 
                        placeholder="Enter your request..." 
                        disabled={!chatEnabled}
                        style={{
                            backgroundColor: chatEnabled ? "white" : "#f2f2f2",
                            cursor: chatEnabled ? "text" : "not-allowed",
                            opacity: chatEnabled ? 1 : 0.6
                        }}
                    />
                </div>
                <div className="chat-input">
                    <button 
                        disabled={!chatEnabled}
                        style={{
                            cursor: chatEnabled ? "pointer" : "not-allowed",
                            opacity: chatEnabled ? 1 : 0.5
                        }}
                    >
                        <PlaneIcon width="24" height="24" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
