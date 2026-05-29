import LostFoundPet from '../models/LostFoundPet.js';
import fs from 'fs';
import path from 'path';

// @desc    Create lost or found pet report
// @route   POST /api/lost-found
// @access  Private
export const createReport = async (req, res) => {
  const { type, breed, color, lat, lng, address, dateTime, contactDetails } = req.body;
  let image = '';

  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  try {
    if (!type || !breed || !color || !lat || !lng || !dateTime || !contactDetails) {
      return res.status(400).json({ success: false, message: 'All lost/found pet fields are required, including location pinning.' });
    }

    const report = await LostFoundPet.create({
      reporter: req.user.id,
      type,
      image,
      breed,
      color,
      lastSeenLocation: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || ''
      },
      dateTime: new Date(dateTime),
      contactDetails,
      status: 'Missing'
    });

    const populatedReport = await LostFoundPet.findById(report._id).populate('reporter', 'name email');

    res.status(201).json({ success: true, message: 'Lost/Found pet reported successfully!', report: populatedReport });
  } catch (error) {
    console.error('Create Lost/Found Report Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating report' });
  }
};

// @desc    Get all lost/found reports
// @route   GET /api/lost-found
// @access  Private
export const getReports = async (req, res) => {
  const { status, type, search } = req.query;

  try {
    let query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { breed: { $regex: new RegExp(search, 'i') } },
        { color: { $regex: new RegExp(search, 'i') } },
        { 'lastSeenLocation.address': { $regex: new RegExp(search, 'i') } }
      ];
    }

    const reports = await LostFoundPet.find(query)
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error('Get Lost/Found Reports Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching reports' });
  }
};

// @desc    Toggle report status
// @route   PUT /api/lost-found/:id/status
// @access  Private
export const toggleStatus = async (req, res) => {
  try {
    const report = await LostFoundPet.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check authorization
    if (report.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this report' });
    }

    report.status = report.status === 'Missing' ? 'Found' : 'Missing';
    await report.save();

    res.json({ success: true, message: `Report status set to ${report.status}`, report });
  } catch (error) {
    console.error('Toggle Lost/Found Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// @desc    Delete report
// @route   DELETE /api/lost-found/:id
// @access  Private
export const deleteReport = async (req, res) => {
  try {
    const report = await LostFoundPet.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check authorization
    if (report.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    // Delete image file
    if (report.image && report.image.startsWith('/uploads/')) {
      const imagePath = path.join('.', report.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await LostFoundPet.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Lost/Found report deleted successfully!' });
  } catch (error) {
    console.error('Delete Lost/Found Report Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting report' });
  }
};
