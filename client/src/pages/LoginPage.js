import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReactComponent as LoginImage } from "styles/images/image 3.svg";
import "styles/AuthStyles.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const logInUser = () => {
    if (email.trim() === "") {
      alert("Email is blank!");
    } else if (password.trim() === "") {
      alert("Password is blank!");
    } else {
      axios
        .post("http://127.0.0.1:5000/login", { email, password })
        .then((response) => {
          console.log(response);
          localStorage.setItem("userEmail", response.data.email);
          localStorage.setItem("authToken", response.data.token);
          navigate("/");
        })
        .catch((error) => {
          console.error("Error details:", error);
          if (error.response) {
            console.log("Error Response:", error.response);
            if (error.response.status === 401) {
              alert("Invalid credentials");
            } else {
              alert(
                "Unexpected error occurred. Status: " +
                  error.response.status
              );
            }
          } else if (error.request) {
            console.log("Error Request:", error.request);
            alert("Network error. Please check your connection.");
          } else {
            console.log("Error Message:", error.message);
            alert("An unexpected error occurred: " + error.message);
          }
        });
    }
  };

  return (
    <div className="page-container">
      <div className="left-side">
        <div className="img-fluid">
          <LoginImage />
        </div>
      </div>
      <div className="right-side">
        <form className="login-form">
          <h2>Login</h2>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter a valid email address"
              id="form3Example3"
            />
            <label htmlFor="form3Example3">Email address</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              id="form3Example4"
            />
            <label htmlFor="form3Example4">Password</label>
          </div>
          <div className="button-group">
            <button type="button" onClick={logInUser}>
              Login
            </button>
            <p>
              Don't have an account? <a href="/register">Register</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
