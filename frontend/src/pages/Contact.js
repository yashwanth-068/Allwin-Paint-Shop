import React, { useState } from 'react';
import { FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill name, email, and message');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        type: form.type
      });

      toast.success(response.data.message || 'Message sent');
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Reach out by email, call us directly, or register a complaint.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-card-header">
              <FiPhone size={24} />
              <h3>Call Us</h3>
            </div>
            <p>Speak to our team for quick support.</p>
            <a className="btn btn-primary" href="tel:+919876543210">Call +91 98765 43210</a>
          </div>

          <div className="contact-card">
            <div className="contact-card-header">
              <FiMail size={24} />
              <h3>Email Us</h3>
            </div>
            <p>Send a message or register a complaint.</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                    <option value="general">General Inquiry</option>
                    <option value="complaint">Register Complaint</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" name="subject" value={form.subject} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-textarea"
                  rows="5"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="contact-card contact-card-highlight">
            <div className="contact-card-header">
              <FiMessageSquare size={24} />
              <h3>Register Complaint</h3>
            </div>
            <p>Complaints are logged and tracked by our team.</p>
            <p className="contact-note">Use the email form and select “Register Complaint”.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
