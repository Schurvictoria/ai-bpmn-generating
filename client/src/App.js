import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import HomePage from "C:\Users\schur\OneDrive\Desktop\Курсовой проект\ai-bpmn-generating\client\src\HomePage.js";
// import LoginPage from "C:\Users\schur\OneDrive\Desktop\Курсовой проект\ai-bpmn-generating\client\src\LoginPage.js";
// import RegisterPage from 'C:\Users\schur\OneDrive\Desktop\Курсовой проект\ai-bpmn-generating\client\src\RegisterPage.js'; 
// import ChatPage from 'C:\Users\schur\OneDrive\Desktop\Курсовой проект\ai-bpmn-generating\client\src\ChatPage.js';
// import PrivateRoute from 'C:\Users\schur\OneDrive\Desktop\Курсовой проект\ai-bpmn-generating\client\src\PrivateRoute.js';
// import BPMNPage from 'C:\Users\schur\OneDrive\Desktop\Курсовой проект\ai-bpmn-generating\client\src\BPMNPage.js';

import HomePage from "pages/HomePage";
import LoginPage from "pages/LoginPage";
import RegisterPage from 'pages/RegisterPage'; 
import ChatPage from 'pages/ChatPage';
import PrivateRoute from 'processing/PrivateRoute';
import BPMNPage from 'pages/BPMNPage';
import EditPage from 'pages/EditBPMN';
import EmailConfirmationPage from 'pages/EmailConfirmationPage';
import EmailConfirmationResultPage from 'pages/EmailConfirmationResultPage'
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
            <Route path="/edit-bpmn" element={<EditPage />} />
            <Route path="/confirm-email" element={<EmailConfirmationPage />} />
            {/* <Route path="/confirm/:token" element={<LoginPage />} /> */}
            <Route path="/confirm/:token" element={<EmailConfirmationResultPage />} />


            
            {/* Защищённый маршрут */}
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />

            {/* Защищённый маршрут */}
            <Route path="/edit-bpmn" element={
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
