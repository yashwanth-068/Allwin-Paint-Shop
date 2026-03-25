import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { 
  FiDollarSign, FiShoppingBag, FiPackage, FiUsers, 
  FiTrendingUp, FiAlertTriangle, FiClock
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  BillingModulePage,
  InventoryModulePage,
  OrdersModulePage,
  ProductsModulePage,
  ReportsModulePage,
  SalesModulePage,
  SettingsModulePage,
  UsersModulePage
} from './ModulePages';
import './Dashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, Title, Tooltip, Legend
);

const OwnerDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/owner');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  const salesChartData = {
    labels: dashboardData?.charts?.monthlySales?.map(d => d._id) || [],
    datasets: [{
      label: 'Monthly Sales',
      data: dashboardData?.charts?.monthlySales?.map(d => d.sales) || [],
      borderColor: '#1e40af',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const categoryData = {
    labels: ['Paints', 'Cement', 'Steel', 'Tools', 'Others'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: ['#1e40af', '#f97316', '#22c55e', '#8b5cf6', '#6b7280']
    }]
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Welcome back! Here's what's happening with your shop.</p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <FiDollarSign size={24} />
          </div>
          <div className="stat-card-value">{formatCurrency(dashboardData?.today?.sales || 0)}</div>
          <div className="stat-card-label">Today's Sales</div>
          <div className="stat-card-change positive">
            <FiTrendingUp /> {dashboardData?.today?.salesCount || 0} transactions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1e40af' }}>
            <FiDollarSign size={24} />
          </div>
          <div className="stat-card-value">{formatCurrency(dashboardData?.monthly?.sales || 0)}</div>
          <div className="stat-card-label">Monthly Sales</div>
          <div className="stat-card-change">
            {dashboardData?.monthly?.salesCount || 0} transactions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <FiShoppingBag size={24} />
          </div>
          <div className="stat-card-value">{dashboardData?.orders?.pending || 0}</div>
          <div className="stat-card-label">Pending Orders</div>
          <Link to="/owner/orders" className="stat-card-link">View all</Link>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <FiAlertTriangle size={24} />
          </div>
          <div className="stat-card-value">{dashboardData?.products?.lowStock || 0}</div>
          <div className="stat-card-label">Low Stock Items</div>
          <Link to="/owner/inventory" className="stat-card-link">View all</Link>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <FiPackage size={24} />
          </div>
          <div className="stat-card-value">{dashboardData?.products?.total || 0}</div>
          <div className="stat-card-label">Total Products</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <FiUsers size={24} />
          </div>
          <div className="stat-card-value">{dashboardData?.users?.total || 0}</div>
          <div className="stat-card-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <FiClock size={24} />
          </div>
          <div className="stat-card-value">{formatCurrency(dashboardData?.credit?.total || 0)}</div>
          <div className="stat-card-label">Credit Pending</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Sales Trend (Last 12 Months)</h3>
          <div className="chart-container">
            <Line 
              data={salesChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Sales by Category</h3>
          <div className="chart-container">
            <Doughnut 
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="tables-grid">
        <div className="table-card">
          <div className="table-header">
            <h3>Recent Orders</h3>
            <Link to="/owner/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentOrders?.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`badge badge-${
                        order.orderStatus === 'delivered' ? 'success' :
                        order.orderStatus === 'cancelled' ? 'danger' : 'warning'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Top Selling Products</h3>
            <Link to="/owner/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.topProducts?.slice(0, 5).map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.totalSold}</td>
                    <td>{formatCurrency(product.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="owner" />
      <main className="dashboard-main">
        <Routes>
          <Route index element={<OwnerDashboardHome />} />
          <Route path="products/*" element={<ProductsModulePage />} />
          <Route path="orders/*" element={<OrdersModulePage />} />
          <Route path="sales/*" element={<SalesModulePage />} />
          <Route path="billing/*" element={<BillingModulePage />} />
          <Route path="inventory/*" element={<InventoryModulePage />} />
          <Route path="users/*" element={<UsersModulePage />} />
          <Route path="reports/*" element={<ReportsModulePage />} />
          <Route path="settings/*" element={<SettingsModulePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default OwnerDashboard;
