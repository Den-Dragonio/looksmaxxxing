import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Scissors, Smile, Activity, ShoppingBag, Settings as SettingsIcon } from 'lucide-react';
import './Sidebar.css';

// Favicon SVG — lightning bolt (same as browser tab icon)
const FaviconLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="30" viewBox="0 0 48 46" fill="none">
    <path
      fill="#863bff"
      d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
    />
  </svg>
);

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <FaviconLogo />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Главная">
          <Home size={28} />
          <span className="nav-label">Главная</span>
        </NavLink>
        <NavLink to="/hair" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Волосы">
          <Scissors size={28} />
          <span className="nav-label">Волосы</span>
        </NavLink>
        <NavLink to="/face" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Лицо">
          <Smile size={28} />
          <span className="nav-label">Лицо</span>
        </NavLink>
        <NavLink to="/body" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Тело">
          <Activity size={28} />
          <span className="nav-label">Тело</span>
        </NavLink>
        <NavLink to="/purchases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Другое">
          <ShoppingBag size={28} />
          <span className="nav-label">Другое</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Настройки">
          <SettingsIcon size={28} />
          <span className="nav-label">Настройки</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
