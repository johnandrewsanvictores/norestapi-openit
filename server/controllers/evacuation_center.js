import EvacuationCenter from '../models/EvacuationCenter.js';

// Get all evacuation centers
export const getEvacuationCenters = async (req, res) => {
  try {
    const centers = await EvacuationCenter.find({ isActive: true })
      .sort({ name: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: centers
    });
  } catch (error) {
    console.error('Error fetching evacuation centers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evacuation centers',
      error: error.message
    });
  }
};

// Get all evacuation centers (admin - includes inactive)
export const getAllEvacuationCenters = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const centers = await EvacuationCenter.find()
      .sort({ name: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: centers
    });
  } catch (error) {
    console.error('Error fetching all evacuation centers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evacuation centers',
      error: error.message
    });
  }
};

// Get single evacuation center
export const getEvacuationCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await EvacuationCenter.findById(id).select('-__v');
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Evacuation center not found'
      });
    }
    
    res.json({
      success: true,
      data: center
    });
  } catch (error) {
    console.error('Error fetching evacuation center:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evacuation center',
      error: error.message
    });
  }
};

// Create evacuation center (admin only)
export const createEvacuationCenter = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const { name, latitude, longitude, city, address, capacity, contact } = req.body;
    
    // Validation
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, and longitude are required'
      });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    const center = new EvacuationCenter({
      name,
      latitude,
      longitude,
      city: city || '',
      address: address || '',
      capacity: capacity || 0,
      contact: contact || '',
      createdBy: req.user?.id || null
    });
    
    await center.save();
    
    res.status(201).json({
      success: true,
      message: 'Evacuation center created successfully',
      data: center
    });
  } catch (error) {
    console.error('Error creating evacuation center:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating evacuation center',
      error: error.message
    });
  }
};

// Update evacuation center (admin only)
export const updateEvacuationCenter = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const { id } = req.params;
    const { name, latitude, longitude, city, address, capacity, contact, isActive } = req.body;
    
    const center = await EvacuationCenter.findById(id);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Evacuation center not found'
      });
    }
    
    // Update fields
    if (name !== undefined) center.name = name;
    if (latitude !== undefined) {
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude'
        });
      }
      center.latitude = latitude;
    }
    if (longitude !== undefined) {
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude'
        });
      }
      center.longitude = longitude;
    }
    if (city !== undefined) center.city = city;
    if (address !== undefined) center.address = address;
    if (capacity !== undefined) center.capacity = capacity;
    if (contact !== undefined) center.contact = contact;
    if (isActive !== undefined) center.isActive = isActive;
    
    center.updatedAt = Date.now();
    await center.save();
    
    res.json({
      success: true,
      message: 'Evacuation center updated successfully',
      data: center
    });
  } catch (error) {
    console.error('Error updating evacuation center:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating evacuation center',
      error: error.message
    });
  }
};

// Delete evacuation center (admin only)
export const deleteEvacuationCenter = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const { id } = req.params;
    
    const center = await EvacuationCenter.findById(id);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Evacuation center not found'
      });
    }
    
    await EvacuationCenter.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Evacuation center deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting evacuation center:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting evacuation center',
      error: error.message
    });
  }
};

