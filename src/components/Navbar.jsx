import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Ana Sayfa' },
  { to: '/hakkimizda', label: 'Hakkımızda' },
  { to: '/branslar', label: 'Branşlarımız' },
  { to: '/sporcularimiz', label: 'Sporcularımız' },
  { to: '/haberler', label: 'Haberler' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/kayit', label: 'Sporcu Kaydı' },
  { to: '/iletisim', label: 'İletişim' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <img src="/images/logo.png" alt="MUSK Spor Kulübü" className="navbar__logo" />
          <span className="navbar__brand-text">
            <span className="navbar__brand-main">MUSK</span>
            <span className="navbar__brand-sub">Spor Kulübü</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  'navbar__link' + (isActive ? ' navbar__link--active' : '')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/panel/login" className="navbar__login-link" onClick={closeMenu}>
              Giriş Yap
            </NavLink>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              'navbar__mobile-link' + (isActive ? ' navbar__mobile-link--active' : '')
            }
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/panel/login"
          className={({ isActive }) =>
            'navbar__mobile-link navbar__mobile-login' + (isActive ? ' navbar__mobile-link--active' : '')
          }
          onClick={closeMenu}
        >
          Giriş Yap
        </NavLink>
      </div>
    </nav>
  );
}
