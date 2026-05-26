import AnimalReport from '../models/AnimalReport.js';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../config/nodemailer.js';
import { io } from '../server.js';

// @desc    Get all animal reports with query filtering (issueType, status)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAllReports = async (req, res) => {
  const { issueType, status, severity } = req.query;
  let query = {};

  if (issueType) {
    query.issueType = issueType;
  }

  if (status) {
    query.status = status;
  }

  if (severity) {
    query.severity = severity;
  }

  try {
    const reports = await AnimalReport.find(query)
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error('Admin Get Reports Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving all reports' });
  }
};

// @desc    Update report status (triggers socket notifications and email alerts)
// @route   PUT /api/admin/reports/:id/status
// @access  Private/Admin
export const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  const reportId = req.params.id;

  if (!status || !['Pending', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status: Pending, In Progress, or Resolved' });
  }

  try {
    const report = await AnimalReport.findById(reportId).populate('reporter', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    // 1. Create a user notification in MongoDB
    const userNotification = await Notification.create({
      user: report.reporter._id,
      title: `Rescue Report Updated: ${status}`,
      message: `The status of your report for a ${report.animalType} (${report.issueType}) is now [${status}].`,
      type: 'status_change'
    });

    // 2. Emit real-time WebSocket push alert
    if (io) {
      io.to(report.reporter._id.toString()).emit('new_notification', userNotification);
      io.to('admin_room').emit('report_updated', report);
    }

    // 3. Send email update alert to user
    const emailSubject = `PawLink — Rescue Report Status Updated [${status}]`;
    const emailText = `Hello ${report.reporter.name},\n\nWe are writing to inform you that the rescue status of your reported animal issue has been updated by PawLink administrators.\n\nIncident Details:\n- Animal: ${report.animalType}\n- Issue: ${report.issueType}\n- Responding Authority: ${report.assignedAuthority}\n- Current Status: ${status}\n\nOur team is working diligently to support this issue. Thank you for reporting.\n\nBest regards,\nThe PawLink Rescue Team`;
    
    // Status colors
    const statusColor = status === 'Resolved' ? '#10b981' : status === 'In Progress' ? '#3b82f6' : '#d97706';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; color: #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">🐾 PawLink Rescue System</h2>
        <p>Hello <strong>${report.reporter.name}</strong>,</p>
        <p>We are writing to notify you that the status of your reported incident has been updated.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f172a;">Status Progress</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Animal:</strong> ${report.animalType}</li>
            <li><strong>Issue Type:</strong> ${report.issueType}</li>
            <li><strong>Responding Authority:</strong> ${report.assignedAuthority}</li>
            <li><strong>Updated Status:</strong> <span style="background-color: ${statusColor}15; color: ${statusColor}; padding: 3px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">${status}</span></li>
          </ul>
        </div>
        <p>Our designated rescue teams are working in conjunction with the responding authorities. Thank you for your continued patience and support.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.85em; color: #64748b;">This is an automated status alert from PawLink. Please do not reply directly to this email.</p>
      </div>
    `;

    await sendEmail(report.reporter.email, emailSubject, emailText, emailHtml);

    res.json({ success: true, message: `Report status updated successfully to ${status}!`, report });
  } catch (error) {
    console.error('Admin Update Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating report status' });
  }
};

// @desc    Get dashboard overview statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalReports = await AnimalReport.countDocuments();
    const pendingReports = await AnimalReport.countDocuments({ status: 'Pending' });
    const inProgressReports = await AnimalReport.countDocuments({ status: 'In Progress' });
    const resolvedReports = await AnimalReport.countDocuments({ status: 'Resolved' });
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPets = await Pet.countDocuments();

    // Grouping count by issue types
    const issueStats = await AnimalReport.aggregate([
      { $group: { _id: '$issueType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        usersCount: totalUsers,
        petsCount: totalPets,
        issueStats
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving statistics' });
  }
};

// @desc    Get all users and their associated pets count
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsersAndPets = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    
    const usersWithPets = await Promise.all(
      users.map(async (user) => {
        const pets = await Pet.find({ owner: user._id });
        return {
          ...user.toObject(),
          petsCount: pets.length,
          pets: pets
        };
      })
    );

    res.json({ success: true, count: usersWithPets.length, users: usersWithPets });
  } catch (error) {
    console.error('Admin Get Users/Pets Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving user data' });
  }
};
