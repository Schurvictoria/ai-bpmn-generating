import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EmailConfirmationResultPage() {
    const { token } = useParams();
    const [status, setStatus] = useState("loading");
    const navigate = useNavigate();

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                const res = await fetch(`http://localhost:5000/confirm/${token}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });

                let data = {};
                try {
                    data = await res.json();
                } catch (e) {
                    setStatus("fail");
                    return;
                }

                if (res.ok && data.message === "Email подтверждён!") {
                    setStatus("success");
                } else if (res.ok && data.message === "Почта уже подтверждена") {
                    setStatus("already");
                } else {
                    setStatus("fail");
                }
            } catch (err) {
                setStatus("fail");
            }

            setTimeout(() => {
                navigate("/login");
            }, 5000);
        };

        confirmEmail();
    }, [token, navigate]);

    const renderMessage = () => {
        switch (status) {
            case "loading":
                return "Ожидаем информацию...";
            case "success":
                return "Email успешно подтверждён!";
            case "already":
                return "Email уже подтверждён ранее.";
            case "fail":
                return "Ошибка подтверждения. Ссылка недействительна или устарела.";
            default:
                return "Что-то пошло не так.";
        }
    };

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>{renderMessage()}</h2>
            {status !== "loading" && <p>Сейчас вы будете перенаправлены на страницу входа...</p>}
        </div>
    );
}
