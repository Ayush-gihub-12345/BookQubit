"use client";

import { useRouter, usePathname } from 'next/navigation';
import './SidebarLeft.css';

const SidebarLeft = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/drift' },
    { id: 'explore', icon: '🔍', label: 'Explore', path: '/drift/explore' },
    { id: 'messages', icon: '💬', label: 'Messages', path: '/drift/messages' },
    { id: 'notifications', icon: '🔔', label: 'Notifications', path: '/drift/notifications' },
    { id: 'my-books', icon: '📚', label: 'My Books', path: '/drift/my-books' },
    { id: 'communities', icon: '👥', label: 'Communities', path: '/drift/communities' },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/drift/profile' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/drift/settings' },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    if (path === '/drift' && pathname === '/drift') return true;
    if (path !== '/drift' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="sidebar-left">
      <div className="logo" onClick={() => handleNavigation('/drift')}>
        <h2>📘 BookQubit</h2>
      </div>
      
      <nav className="nav-menu">
        <ul>
          {navItems.map((item) => (
            <li 
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="user-info" onClick={() => handleNavigation('/drift/profile')}>
        <img src="/default-avatar.png" alt="Avatar" />
        <div>
          <strong>Reader Name</strong>
          <small>@username</small>
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;