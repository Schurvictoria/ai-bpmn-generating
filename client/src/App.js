import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from "./pages/HomePage";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import PrivateRoute from './modules/PrivateRoute';
import BPMNPage from './pages/BPMNPage';
function App() {
  return (
    <BrowserRouter>
      <div className="vh-100 gradient-custom">
        <div className="container">
          <h1 className="page-header text-center"></h1>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/logout" element={<LoginPage />} />
            <Route path="/describe-bpmn" element={<BPMNPage />} />
            
            {/* Защищённый маршрут */}
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />

            {/* Защищённый маршрут */}
            <Route path="/describe-bpmn" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />

            <Route path="/" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
