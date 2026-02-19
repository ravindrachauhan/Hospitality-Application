import React, { useState, useEffect } from 'react';
import { customerService, productService, orderService, billingService, gymService } from '../../services/api';
import './Modal.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ customers:0, products:0, orders:0, revenue:0, activities:0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      customerService.getAll(),
      productService.getAll(),
      orderService.getAll(),
      billingService.getAll(),
      gymService.getAll(),
    ]).then(([c, p, o, b, g]) => {
      const revenue = b.data.filter(x => x.payment_status === 'paid').reduce((sum, x) => sum + parseFloat(x.total_amount || 0), 0);
      setStats({ customers: c.data.length, products: p.data.length, orders: o.data.length, revenue, activities: g.data.length });
      setRecentOrders(o.data.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Customers', value: stats.customers, icon: '👥', color: '#EEF2FF', iconColor: '#4F46E5' },
    { label: 'Products', value: stats.products, icon: '📦', color: '#FEF3C7', iconColor: '#D97706' },
    { label: 'Total Orders', value: stats.orders, icon: '🛒', color: '#D1FAE5', iconColor: '#059669' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '💰', color: '#FCE7F3', iconColor: '#DB2777' },
    { label: 'GYM Activities', value: stats.activities, icon: '🏋️', color: '#FEE2E2', iconColor: '#DC2626' },
  ];

  return (
    <div className="section-content">
      <div style={{marginBottom:24}}>
        <h2 className="section-title">Dashboard Overview</h2>
        <p className="section-sub">Welcome back! Here's your FitPro summary.</p>
      </div>

      {loading ? <div className="loading-state"><div className="spinner"></div></div> : (
        <>
          <div className="stat-grid">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{background:s.color, color:s.iconColor}}>{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="empty-row">No recent orders</td></tr>
                  ) : recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#ORD-{String(o.id).padStart(4,'0')}</strong></td>
                      <td>{o.customer_name || 'Walk-in'}</td>
                      <td>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                      <td><span className={`badge badge-${o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warning'}`}>{o.status}</span></td>
                      <td>{new Date(o.order_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
