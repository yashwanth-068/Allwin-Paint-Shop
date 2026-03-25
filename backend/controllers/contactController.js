const nodemailer = require('nodemailer');
const Complaint = require('../models/Complaint');

const buildTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    const normalizedType = type === 'complaint' ? 'complaint' : 'general';
    const transporter = buildTransporter();

    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured'
      });
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"All Win Paint Shop" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: subject || (normalizedType === 'complaint' ? 'New Complaint' : 'New Contact Request'),
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nType: ${normalizedType}\n\n${message}`,
      html: `
        <h2>${normalizedType === 'complaint' ? 'New Complaint' : 'New Contact Request'}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || '-'}</p>
        <p><strong>Type:</strong> ${normalizedType}</p>
        <p><strong>Subject:</strong> ${subject || '-'}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `
    });

    let complaintRecord;
    if (normalizedType === 'complaint') {
      complaintRecord = await Complaint.create({
        name,
        email,
        phone,
        subject,
        message,
        type: normalizedType
      });
    }

    return res.status(200).json({
      success: true,
      data: complaintRecord || null,
      message: normalizedType === 'complaint' ? 'Complaint registered successfully' : 'Message sent successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
