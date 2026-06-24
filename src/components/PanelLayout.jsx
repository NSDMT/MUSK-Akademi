import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PanelLayout.css';

const NAV = {
  admin: [
    { path: '/panel/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/panel/admin/students', label: 'Öğrenciler', icon: '👦' },
    { path: '/panel/admin/users', label: 'Kullanıcılar', icon: '👤' },
    { path: '/panel/admin/groups', label: 'Gruplar', icon: '🏆' },
    { path: '/panel/admin/schedule', label: 'Antrenman Takvimi', icon: '📅' },
    { path: '/panel/admin/dues', label: 'Aidat Yönetimi', icon: '💰' },
    { path: '/panel/admin/applications', label: 'Başvurular', icon: '📋' },
    { path: '/panel/admin/sponsors', label: 'Sponsorlar', icon: '🏢' },
  ],
  antrenor: [
    { path: '/panel/antrenor/dashboard', label: 'Takvimim & Yoklama', icon: '📅' },
  ],
  veli: [
    { path: '/panel/veli/dashboard', label: 'Çocuğum & Aidat', icon: '👶' },
  ],
};

const ROLE_LABEL = { admin: 'Admin', antrenor: 'Antrenör', veli: 'Veli' };

export default function PanelLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/panel/login');
  }

  const items = NAV[user?.role] || [];

  return (
    <div className="pl">
      <aside className="pl__sidebar">
        <div className="pl__brand">
          <span className="pl__brand-icon">⚽</span>
          <div>
            <div className="pl__brand-name">MU Spor</div>
            <div className="pl__brand-sub">Yönetim Paneli</div>
          </div>
        </div>

        <nav className="pl__nav">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `pl__link${isActive ? ' pl__link--active' : ''}`}
            >
              <span className="pl__link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pl__footer">
          <div className="pl__user">
            <div className="pl__avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="pl__user-name">{user?.name}</div>
              <div className="pl__user-role">{ROLE_LABEL[user?.role]}</div>
            </div>
          </div>
          <button className="pl__logout" onClick={handleLogout} title="Çıkış">↩</button>
        </div>
      </aside>

      <main className="pl__main">
        {children}
      </main>
    </div>
  );
}
