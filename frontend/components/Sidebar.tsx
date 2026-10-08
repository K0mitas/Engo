import { NavLink } from 'react-router-dom';

const menuItems = [
  { to: '/projects', label: 'Проекты', icon: '🎬' },
  { to: '/characters', label: 'Персонажи', icon: '👤' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">▶</div>
        <span className="sidebar__logo-text">Engo</span>
      </div>

      <nav className="sidebar__nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
            }
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__storage">
        <div className="sidebar__storage-label">Хранилище</div>
        <div className="sidebar__storage-value">12.4 GB / 100 GB</div>
        <div className="sidebar__storage-bar">
          <div className="sidebar__storage-fill" style={{ width: '12.4%' }} />
        </div>
      </div>
    </aside>
  );
}