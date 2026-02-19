import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/modals/DashboardOverview';
import CustomersModal from '../components/modals/CustomersModal';
import ProductsModal from '../components/modals/ProductsModal';
import OrdersModal from '../components/modals/OrdersModal';
import BillingModal from '../components/modals/BillingModal';
import GymModal from '../components/modals/GymModal';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  orders: 'Orders',
  billing: 'Billing & Receipts',
  gym: 'GYM Activities',
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardOverview />;
      case 'customers': return <CustomersModal />;
      case 'products': return <ProductsModal />;
      case 'orders': return <OrdersModal />;
      case 'billing': return <BillingModal />;
      case 'gym': return <GymModal />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">{SECTION_TITLES[activeSection]}</h1>
            <span className="header-breadcrumb">
              FitPro {activeSection !== 'dashboard' && `› ${SECTION_TITLES[activeSection]}`}
            </span>
          </div>
          <div className="header-right">
            <div className="header-date">
              {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </div>
            <div className="header-user">
              <div className="header-avatar">{user?.full_name?.charAt(0)}</div>
              <span>{user?.full_name}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
