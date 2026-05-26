import AnimalReport from '../models/AnimalReport.js';
import Authority from '../models/Authority.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../config/nodemailer.js';
import { io } from '../server.js'; // We will export 'io' from server.js

// Haversine distance calculator in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find the closest authority from a list based on user coordinates
const findNearest = (list, lat, lng) => {
  if (!list || list.length === 0) return null;

  let nearestItem = null;
  let minDistance = Infinity;

  for (const item of list) {
    const dist = calculateDistance(lat, lng, item.location.lat, item.location.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestItem = item;
    }
  }
  return nearestItem;
};

// Smart Alert Routing utility to assign the closest authority based on coordinates and issueType
export const assignAuthority = async (issueType, lat, lng) => {
  try {
    if (issueType === 'Dead/Decomposed') {
      const municipalities = await Authority.find({ type: 'Municipality' });
      const nearest = findNearest(municipalities, lat, lng);
      return nearest ? nearest.name : 'Local Corporation/Municipality';
    } 
    
    if (issueType === 'Rescue Request') {
      const fireForces = await Authority.find({ type: 'Fire Force' });
      const animalHospitals = await Authority.find({ type: 'Animal Hospital' });
      
      const nearestFire = findNearest(fireForces, lat, lng);
      const nearestHospital = findNearest(animalHospitals, lat, lng);
      
      const fireName = nearestFire ? nearestFire.name : 'Local Fire Force';
      const hospitalName = nearestHospital ? nearestHospital.name : 'Nearest Animal Hospital';
      
      return `${fireName} & ${hospitalName}`;
    } 
    
    if (issueType === 'Treatment Required' || issueType === 'Injured') {
      const vetHospitals = await Authority.find({ type: 'Veterinary Hospital' });
      const nearest = findNearest(vetHospitals, lat, lng);
      return nearest ? nearest.name : 'Nearest Veterinary Clinic';
    } 
    
    if (issueType === 'Wild Animal Sighting') {
      const forestOffices = await Authority.find({ type: 'Forest Office' });
      const nearest = findNearest(forestOffices, lat, lng);
      return nearest ? nearest.name : 'Nearest Forest Department Office';
    }

    // Default fallback
    const fallbackHospitals = await Authority.find({ type: 'Veterinary Hospital' });
    const nearestFallback = findNearest(fallbackHospitals, lat, lng);
    return nearestFallback ? nearestFallback.name : 'Nearest Veterinary Hospital';
  } catch (error) {
    console.error('Smart Routing Error:', error);
    return 'Default Animal Welfare Board';
  }
};

// @desc    Create a new animal issue report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  const { animalType, issueType, description, lat, lng, address, severity, contactDetails } = req.body;
  let photo = '';

  if (req.file) {
    photo = `/uploads/${req.file.filename}`;
  }

  try {
    if (!animalType || !issueType || !description || !lat || !lng || !severity || !contactDetails) {
      return res.status(400).json({ success: false, message: 'All report fields and coordinates are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Run the Smart Alert Routing System
    const assignedAuthority = await assignAuthority(issueType, latitude, longitude);

    const report = await AnimalReport.create({
      reporter: req.user.id,
      animalType,
      issueType,
      description,
      photo,
      location: {
        lat: latitude,
        lng: longitude,
        address: address || ''
      },
      severity,
      contactDetails,
      assignedAuthority,
      status: 'Pending'
    });

    // Create Notification logs in DB for User and Admin
    const userNotification = await Notification.create({
      user: req.user.id,
      title: 'Report Submitted Successfully',
      message: `Your report for a ${animalType} (${issueType}) has been logged. Assigned: ${assignedAuthority}.`,
      type: 'info'
    });

    const adminNotification = await Notification.create({
      user: null, // Null represents admin/system-wide notification
      title: `🚨 New ${severity} Animal Issue!`,
      message: `A new ${issueType} for a ${animalType} has been reported. Severity: ${severity}.`,
      type: 'alert'
    });

    // Emit live real-time notifications via WebSockets
    if (io) {
      // Alert the reporter
      io.to(req.user.id.toString()).emit('new_notification', userNotification);
      // Alert all connected admins
      io.to('admin_room').emit('new_notification', adminNotification);
      io.to('admin_room').emit('new_report', report);
    }

    // Send email alert to user
    const emailSubject = `PawLink — Animal Issue Report Registered [Status: Pending]`;
    const emailText = `Hello ${req.user.name},\n\nYour report has been successfully registered on PawLink.\n\nReport Details:\n- Animal: ${animalType}\n- Issue: ${issueType}\n- Description: ${description}\n- Severity: ${severity}\n- Assigned Responding Body: ${assignedAuthority}\n\nWe will alert you as soon as action is taken.\n\nThank you,\nThe PawLink Rescue Team`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; color: #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">🐾 PawLink Rescue System</h2>
        <p>Hello <strong>${req.user.name}</strong>,</p>
        <p>Your report has been successfully registered in our community animal rescue database.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f172a;">Incident Details</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Animal Type:</strong> ${animalType}</li>
            <li><strong>Issue Reported:</strong> ${issueType}</li>
            <li><strong>Severity Level:</strong> <span style="color: #ef4444; font-weight: bold;">${severity}</span></li>
            <li><strong>Assigned Authority:</strong> ${assignedAuthority}</li>
            <li><strong>Current Status:</strong> <span style="background-color: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">Pending</span></li>
          </ul>
        </div>
        <p>The assigned responding organization has been alerted. We will notify you in real-time as the rescue status progresses.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.85em; color: #64748b;">This is an automated system notification from PawLink. Thank you for reporting and keeping our animal community safe.</p>
      </div>
    `;

    await sendEmail(req.user.email, emailSubject, emailText, emailHtml);

    res.status(201).json({
      success: true,
      message: 'Animal issue report submitted successfully! Responders have been dispatched.',
      report
    });
  } catch (error) {
    console.error('Create Report Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating report' });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/my
// @access  Private
export const getMyReports = async (req, res) => {
  try {
    const reports = await AnimalReport.find({ reporter: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error('Get My Reports Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching user reports' });
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const report = await AnimalReport.findById(req.params.id).populate('reporter', 'name email');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Ensure the reporter or admin is accessing
    if (report.reporter._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get Report Detail Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving report details' });
  }
};
