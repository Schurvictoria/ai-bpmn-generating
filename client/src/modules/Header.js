import React, { useEffect, useState } from 'react';
import 'styles/Header.css';
import { ReactComponent as LogoutIcon } from 'styles/Icons/sign-out.svg';
import { ReactComponent as HomeIcon } from 'styles/Icons/home_icon.svg';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('authToken') && !!localStorage.getItem('userEmail')
  );
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');

    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="left">
        <a href="/" className="home-icon">
          <HomeIcon className="icon" />
        </a>
      </div>

      <div className="right">
        {isAuthenticated && (
          <>
            <span className="username">{userEmail}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <LogoutIcon className="logout-icon" />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
