import Pet from '../models/Pet.js';
import fs from 'fs';
import path from 'path';

// @desc    Add a new pet
// @route   POST /api/pets
// @access  Private
export const addPet = async (req, res) => {
  const { name, breed, age, vaccinationDetails, medicalHistory } = req.body;
  let image = '';

  if (req.file) {
    // Save the local path (will be served statically)
    image = `/uploads/${req.file.filename}`;
  }

  try {
    if (!name || !breed || !age) {
      return res.status(400).json({ success: false, message: 'Name, breed, and age are required' });
    }

    const pet = await Pet.create({
      owner: req.user.id,
      name,
      breed,
      age: parseInt(age),
      vaccinationDetails: vaccinationDetails || '',
      medicalHistory: medicalHistory || '',
      image
    });

    res.status(201).json({ success: true, message: 'Pet added successfully!', pet });
  } catch (error) {
    console.error('Add Pet Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding pet' });
  }
};

// @desc    Get user's pets
// @route   GET /api/pets
// @access  Private
export const getPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: pets.length, pets });
  } catch (error) {
    console.error('Get Pets Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving pets' });
  }
};

// @desc    Update pet details
// @route   PUT /api/pets/:id
// @access  Private
export const updatePet = async (req, res) => {
  const { name, breed, age, vaccinationDetails, medicalHistory } = req.body;
  const petId = req.params.id;

  try {
    let pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Check ownership
    if (pet.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this pet' });
    }

    // Handle image update
    let image = pet.image;
    if (req.file) {
      // Delete old image if it exists and was an uploaded file
      if (pet.image && pet.image.startsWith('/uploads/')) {
        const oldImagePath = path.join('.', pet.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = `/uploads/${req.file.filename}`;
    }

    pet.name = name || pet.name;
    pet.breed = breed || pet.breed;
    pet.age = age ? parseInt(age) : pet.age;
    pet.vaccinationDetails = vaccinationDetails !== undefined ? vaccinationDetails : pet.vaccinationDetails;
    pet.medicalHistory = medicalHistory !== undefined ? medicalHistory : pet.medicalHistory;
    pet.image = image;

    await pet.save();

    res.json({ success: true, message: 'Pet details updated successfully!', pet });
  } catch (error) {
    console.error('Update Pet Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating pet' });
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Private
export const deletePet = async (req, res) => {
  const petId = req.params.id;

  try {
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Check ownership
    if (pet.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this pet' });
    }

    // Delete image file from server
    if (pet.image && pet.image.startsWith('/uploads/')) {
      const imagePath = path.join('.', pet.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Pet.findByIdAndDelete(petId);

    res.json({ success: true, message: 'Pet deleted successfully!' });
  } catch (error) {
    console.error('Delete Pet Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting pet' });
  }
};
