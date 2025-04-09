import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import 'styles/confirmation.css';

export default function EmailConfirmationPage() {
    const [error, setError] = useState("");
    const [resendSuccess, setResendSuccess] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const email = new URLSearchParams(location.search).get("email");

    const handleResend = async () => {
        try {
            const res = await fetch("http://localhost:5000/resend-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error, please try again");
            }

            alert("The email has already been sent");
            setResendSuccess(true);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="confirmation-page">
            <div className="confirmation-container">
                <h2 className="confirmation-title">Email confirmation</h2>
                <p className="confirmation-text">
                The confirmation link has been sent to your email. Click on it to complete the registration.
                </p>
                {/* <strong>{useremail}</strong> */}
                <button className="resend-button" onClick={handleResend}>
                Resend email
                </button>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
}
