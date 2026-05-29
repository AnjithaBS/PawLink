import AdoptionListing from '../models/AdoptionListing.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// @desc    Create adoption listing
// @route   POST /api/adoption
// @access  Private
export const createListing = async (req, res) => {
  const { animalType, breed, age, vaccinationStatus, description, location, contactDetails } = req.body;
  let image = '';

  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  try {
    if (!image) {
      return res.status(400).json({ success: false, message: 'Animal image is required' });
    }
    if (!animalType || !breed || !age || !vaccinationStatus || !description || !location || !contactDetails) {
      return res.status(400).json({ success: false, message: 'All adoption form fields are required' });
    }

    const listing = await AdoptionListing.create({
      owner: req.user.id,
      image,
      animalType,
      breed,
      age: parseInt(age),
      vaccinationStatus,
      description,
      location,
      contactDetails,
      status: 'Available'
    });

    const populatedListing = await AdoptionListing.findById(listing._id).populate('owner', 'name email');

    res.status(201).json({ success: true, message: 'Adoption listing posted successfully!', listing: populatedListing });
  } catch (error) {
    console.error('Create Adoption Listing Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating listing' });
  }
};

// @desc    Get/Filter all adoption listings
// @route   GET /api/adoption
// @access  Private
export const getListings = async (req, res) => {
  const { search, animalType, status } = req.query;

  try {
    let query = {};

    if (animalType) {
      query.animalType = { $regex: new RegExp(animalType, 'i') };
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { breed: { $regex: new RegExp(search, 'i') } },
        { location: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const listings = await AdoptionListing.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    console.error('Get Adoption Listings Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving listings' });
  }
};

// @desc    Toggle adoption status
// @route   PUT /api/adoption/:id/status
// @access  Private
export const toggleStatus = async (req, res) => {
  try {
    const listing = await AdoptionListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this listing' });
    }

    listing.status = 'Adopted';
    await listing.save();

    let userHasPetUpdated = false;
    // Mark listing owner and current user (if different) as having a pet (hasPet = true)
    await User.findByIdAndUpdate(listing.owner, { hasPet: true });
    if (req.user.id !== listing.owner.toString()) {
      await User.findByIdAndUpdate(req.user.id, { hasPet: true });
    }
    userHasPetUpdated = true;

    res.json({ 
      success: true, 
      message: `Status updated to ${listing.status}`, 
      listing,
      userHasPetUpdated
    });
  } catch (error) {
    console.error('Toggle Adoption Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};

// @desc    Delete adoption listing
// @route   DELETE /api/adoption/:id
// @access  Private
export const deleteListing = async (req, res) => {
  try {
    const listing = await AdoptionListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    // Delete image file
    if (listing.image && listing.image.startsWith('/uploads/')) {
      const imagePath = path.join('.', listing.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await AdoptionListing.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Adoption listing removed successfully!' });
  } catch (error) {
    console.error('Delete Listing Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting listing' });
  }
};
