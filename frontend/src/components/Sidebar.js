import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiDollarSign, 
  FiBarChart2, FiSettings, FiLogOut, FiFileText, FiBox
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const ownerLinks = [
    { path: '/owner', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/owner/products', icon: FiPackage, label: 'Products' },
    { path: '/owner/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/owner/sales', icon: FiDollarSign, label: 'Sales' },
    { path: '/owner/billing', icon: FiFileText, label: 'Billing' },
    { path: '/owner/inventory', icon: FiBox, label: 'Inventory' },
    { path: '/owner/users', icon: FiUsers, label: 'Users' },
    { path: '/owner/reports', icon: FiBarChart2, label: 'Reports' },
    { path: '/owner/settings', icon: FiSettings, label: 'Settings' }
  ];

  const managerLinks = [
    { path: '/manager', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/manager/billing', icon: FiFileText, label: 'Billing' },
    { path: '/manager/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/manager/sales', icon: FiDollarSign, label: 'Sales' },
    { path: '/manager/products', icon: FiPackage, label: 'Products' },
    { path: '/manager/inventory', icon: FiBox, label: 'Inventory' }
  ];

  const links = role === 'owner' ? ownerLinks : managerLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">AWP</div>
        <div className="sidebar-brand">
          <span className="sidebar-title">All Win Shop</span>
          <span className="sidebar-role">{role === 'owner' ? 'Owner Panel' : 'Manager Panel'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
