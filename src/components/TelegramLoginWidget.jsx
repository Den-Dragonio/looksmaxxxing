import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const TelegramLoginWidget = ({ botName = "samplebot" }) => {
  const containerRef = useRef(null);
  const { setTelegramUser, showToast } = useAppContext();

  useEffect(() => {
    // Define the global callback function
    window.onTelegramAuth = (user) => {
      setTelegramUser(user);
      showToast(`Добро пожаловать, ${user.first_name}!`);
    };

    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    // Attach it to the container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      if (containerRef.current && containerRef.current.contains(script)) {
        containerRef.current.removeChild(script);
      }
      delete window.onTelegramAuth;
    };
  }, [botName, setTelegramUser, showToast]);

  return (
    <div 
      ref={containerRef} 
      className="telegram-login-container" 
      style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
    />
  );
};

export default TelegramLoginWidget;
