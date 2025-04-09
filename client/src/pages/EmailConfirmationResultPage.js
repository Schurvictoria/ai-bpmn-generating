import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import 'styles/confirmation.css';

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

                const data = await res.json();

                if (res.ok) {
                    if (data.message === "Email confirmed!") {
                        setStatus("success");
                    } else if (data.message === "The email has already been confirmed") {
                        setStatus("already");
                    } else {
                        setStatus("fail");
                    }
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
                return "Waiting for confirmation...";
            case "success":
                return "Your email has been successfully confirmed!";
            case "already":
                return "Email was already confirmed.";
            case "fail":
                return "Confirmation failed. The link is invalid or expired.";
            default:
                return "Something went wrong.";
        }
    };

    return (
        <div className="confirmation-page">
            <div className="confirmation-container"></div>
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2 className="confirmation-title">{renderMessage()}</h2>
                {status !== "loading" && (
                    <p className="confirmation-text">
                        You will be redirected to the login page shortly...
                    </p>
                )}
            </div>
        </div>
    );
}
