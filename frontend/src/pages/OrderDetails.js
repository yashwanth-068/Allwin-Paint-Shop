import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatCurrency, formatDateTime, getStatusClass } from '../utils/helpers';
import './ModulePages.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by buyer' });
      toast.success('Order cancelled');
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="module-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="module-empty">
          <h3>Order not found.</h3>
          <Link to="/orders" className="btn btn-primary mt-3">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const hasColorCodes = order.items?.some((item) => item.colorCode);

  return (
    <div className="container" style={{ padding: '2rem 1rem 3rem' }}>
      <div className="dashboard-header">
        <div>
          <h1>Order {order.orderNumber}</h1>
          <p>Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="module-actions">
          <Link to="/orders" className="btn btn-outline btn-sm">
            Back
          </Link>
          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <button className="btn btn-outline btn-sm" disabled={cancelling} onClick={handleCancelOrder}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <span className="module-kpi-label">Order Status</span>
          <span className={`badge ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
        </div>
        <div className="module-kpi-card">
          <span className="module-kpi-label">Payment Status</span>
          <span className={`badge ${getStatusClass(order.paymentStatus)}`}>{order.paymentStatus}</span>
        </div>
        <div className="module-kpi-card">
          <span className="module-kpi-label">Order Total</span>
          <strong>{formatCurrency(order.totalAmount)}</strong>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Shipping Address</h3>
        </div>
        <div className="card-body">
          <p className="font-semibold">{order.shippingAddress?.name}</p>
          <p>{order.shippingAddress?.street}</p>
          <p>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </p>
          <p>Phone: {order.shippingAddress?.phone}</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Order Items</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                {hasColorCodes && <th>Paint Code</th>}
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  {hasColorCodes && <td>{item.colorCode || '-'}</td>}
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.gst)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
