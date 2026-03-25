import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatCurrency, formatDateTime, getStatusClass } from '../utils/helpers';
import './ModulePages.css';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/myorders');
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by buyer'
      });
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel order');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 3rem' }}>
      <div className="dashboard-header">
        <div>
          <h1>My Orders</h1>
          <p>Track your recent purchases</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="module-loading">
            <div className="spinner"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="module-empty">
            <h3>You have not placed any orders yet.</h3>
            <Link to="/products" className="btn btn-primary mt-3">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${getStatusClass(order.paymentStatus)}`}>{order.paymentStatus}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <div className="module-action-buttons">
                        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                          View
                        </Link>
                        {['pending', 'confirmed'].includes(order.orderStatus) && (
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={updatingId === order._id}
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            {updatingId === order._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;
