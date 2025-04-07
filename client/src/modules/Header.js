import React, { useEffect, useState } from 'react';
import '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/styles/Header.css';
import { ReactComponent as LogoutIcon } from '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/styles/Icons/sign-out.svg';
import { ReactComponent as HomeIcon } from '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/styles/Icons/home.svg';
import { ReactComponent as UserIcon } from '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/styles/Icons/user.svg';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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

  if (!isAuthenticated) return null;

  return (
    <header className="header">
      <div className="left">
        <a href="/" className="home-icon">
          <HomeIcon className="icon" />
        </a>
      </div>

      <div className="left">
        <button className="logout-btn" onClick={handleLogout}>
          <LogoutIcon className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>

      <div className="left">
      {/* <UserIcon className="logout-icon" /> */}
        <span className="username">{userEmail}</span>
      </div>
    </header>
  );
};

export default Header;
