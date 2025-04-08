import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {ReactComponent as RegisterImage } from 'styles/images/image 4.svg'
import "styles/AuthStyles.css";

export default function RegisterPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const registerUser = () => {
        axios.post('http://127.0.0.1:5000/signup', {
            email: email,
            password: password
        })
        .then(function (response) {
            console.log(response);
            navigate("/confirm-email?email=${email}");
        })
        .catch(function (error) {
            console.log(error, 'error');
            if (error.response && error.response.status === 401) {
                alert("Invalid credentials");
            }
        });
    };

    return (
        <div className="page-container">
            <div className="left-side">
                     <div className="img-fluid">
                        <RegisterImage />
                      </div>
            </div>

            <div className="right-side">
                <form className="login-form">
                    <h2>Create Your Account</h2>
                    <div className="form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter a valid email address"
                            id="email"
                            className="input-field"
                        />
                        <label htmlFor="email">Email address</label>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            id="password"
                            className="input-field"
                        />
                        <label htmlFor="password">Password</label>
                    </div>

                    <div className="form-actions">
                    <div className="button-group">
                        <button type="button" className="btn" onClick={registerUser}>
                            Sign Up
                        </button>
                        
                        <p className="small">
                            Already have an account? <a href="/login" className="link">Login</a>
                        </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
