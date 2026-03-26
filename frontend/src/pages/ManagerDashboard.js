import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingBag, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { formatCurrency, formatDateTime, getStatusClass } from '../utils/helpers';
import {
  BillingModulePage,
  InventoryModulePage,
  OrdersModulePage,
  ProductsModulePage,
  SalesModulePage,
  SettingsModulePage
} from './ModulePages';
import './Dashboard.css';

const ManagerDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/manager');
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

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Manage sales, orders, and inventory</p>
        </div>
        <Link to="/manager/billing" className="btn btn-primary">
          <FiPlus /> New Sale
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <FiDollarSign size={24} />
          </div>
          <div className="stat-card-value">{formatCurrency(dashboardData?.today?.sales || 0)}</div>
          <div className="stat-card-label">Today's Sales</div>
          <div className="stat-card-change positive">
            {dashboardData?.today?.salesCount || 0} transactions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <FiShoppingBag size={24} />
          </div>
          <div className="stat-card-value">{dashboardData?.today?.orders || 0}</div>
          <div className="stat-card-label">Today's Orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <FiAlertTriangle size={24} />
          </div>
          <div className="stat-card-value">{dashboardData?.lowStockProducts?.length || 0}</div>
          <div className="stat-card-label">Low Stock Items</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/manager/billing" className="quick-action-card">
            <FiDollarSign size={24} />
            <span>Create Bill</span>
          </Link>
          <Link to="/manager/orders" className="quick-action-card">
            <FiShoppingBag size={24} />
            <span>Process Orders</span>
          </Link>
          <Link to="/manager/products" className="quick-action-card">
            <FiPlus size={24} />
            <span>Add Product</span>
          </Link>
          <Link to="/manager/inventory" className="quick-action-card">
            <FiAlertTriangle size={24} />
            <span>Update Stock</span>
          </Link>
        </div>
      </div>

      {/* Tables */}
      <div className="tables-grid">
        <div className="table-card">
          <div className="table-header">
            <h3>Pending Orders</h3>
            <Link to="/manager/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-container">
            {dashboardData?.pendingOrders?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.pendingOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>
                        <div>
                          <span>{order.user?.name}</span>
                          <small className="text-gray-500 block">{order.user?.phone}</small>
                        </div>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline">
                          Process
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No pending orders</p>
              </div>
            )}
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Low Stock Alert</h3>
            <Link to="/manager/inventory" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-container">
            {dashboardData?.lowStockProducts?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Min Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.lowStockProducts.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>
                        <span className={product.stock === 0 ? 'text-danger font-bold' : 'text-warning'}>
                          {product.stock}
                        </span>
                      </td>
                      <td>{product.minStock}</td>
                      <td>
                        <Link to={`/manager/inventory?product=${product._id}`} className="btn btn-sm btn-outline">
                          Update
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>All products have adequate stock</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Recent Sales */}
      <div className="table-card">
        <div className="table-header">
          <h3>My Recent Sales</h3>
          <Link to="/manager/sales" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-container">
          {dashboardData?.mySales?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.mySales.map(sale => (
                  <tr key={sale._id}>
                    <td>{sale.billNumber}</td>
                    <td>{sale.customer?.name}</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td>{formatDateTime(sale.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No sales yet today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="manager" />
      <main className="dashboard-main">
      <Routes>
        <Route index element={<ManagerDashboardHome />} />
        <Route path="billing/*" element={<BillingModulePage />} />
        <Route path="orders/*" element={<OrdersModulePage />} />
        <Route path="sales/*" element={<SalesModulePage />} />
        <Route path="products/*" element={<ProductsModulePage />} />
        <Route path="inventory/*" element={<InventoryModulePage />} />
        <Route path="settings/*" element={<SettingsModulePage />} />
      </Routes>
      </main>
    </div>
  );
};

export default ManagerDashboard;
