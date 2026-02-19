import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const menuItems = [
  {
    label: 'Masters',
    icon: '📁',
    children: [
      { label: 'Customers', icon: '👥', key: 'customers' },
      { label: 'Products', icon: '📦', key: 'products' },
    ]
  },
  {
    label: 'Transactions',
    icon: '💳',
    children: [
      { label: 'Orders', icon: '🛒', key: 'orders' },
      { label: 'Billing & Receipts', icon: '🧾', key: 'billing' },
    ]
  },
  {
    label: 'GYM Activities',
    icon: '🏋️',
    key: 'gym',
    children: []
  }
];

export default function Sidebar({ activeSection, onSectionChange }) {
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState(['Masters', 'Transactions', 'GYM Activities']);

  const toggleGroup = (label) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const handleItemClick = (key) => {
    onSectionChange(key);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🏋️</span>
        <div>
          <div className="logo-name">FitPro</div>
          <div className="logo-sub">Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item flat ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSectionChange('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </button>

        {menuItems.map(group => (
          <div key={group.label} className="nav-group">
            {group.children && group.children.length > 0 ? (
              <>
                <button
                  className="nav-group-header"
                  onClick={() => toggleGroup(group.label)}
                >
                  <span className="nav-icon">{group.icon}</span>
                  <span className="nav-label">{group.label}</span>
                  <span className={`chevron ${expandedGroups.includes(group.label) ? 'open' : ''}`}>›</span>
                </button>
                {expandedGroups.includes(group.label) && (
                  <div className="nav-children">
                    {group.children.map(item => (
                      <button
                        key={item.key}
                        className={`nav-item child ${activeSection === item.key ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.key)}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                className={`nav-item flat ${activeSection === group.key ? 'active' : ''}`}
                onClick={() => handleItemClick(group.key)}
              >
                <span className="nav-icon">{group.icon}</span>
                <span className="nav-label">{group.label}</span>
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.full_name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.full_name}</div>
            <div className="user-role">{user?.role_name}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
