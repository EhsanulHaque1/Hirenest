import User from '../models/User.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const completeProfile = async (req, res) => {
  try {
    console.log('Profile complete request:', {
      role: req.user.role,
      hasNidImages: req.files && req.files['nidImages'] ? req.files['nidImages'].length : 0,
      hasCerts: req.files && req.files['certificationImages'] ? req.files['certificationImages'].length : 0,
    });

    const userId = req.user.id;
    const { jobField } = req.body;
    let updateData = { profileComplete: true };

    const nidFiles = req.files && req.files['nidImages'];
    if (nidFiles && nidFiles.length > 0) {
      const nidUrls = await Promise.all(nidFiles.map(file => uploadToCloudinary(file)));
      console.log('✅ NID Images uploaded:', nidUrls);
      updateData.nidImages = nidUrls;
    }

    const certFiles = req.files && req.files['certificationImages'];
    if (certFiles && certFiles.length > 0) {
      const certUrls = await Promise.all(certFiles.map(file => uploadToCloudinary(file)));
      console.log('✅ Certs uploaded:', certUrls);
      updateData.certificationImages = certUrls;
    }
    if (jobField) {
      updateData.jobField = jobField;
      console.log('📋 JobField:', jobField);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash -verificationToken');

    console.log('👤 Profile completed for user:', user.username);

    res.json({ message: 'Profile completed successfully', user });
  } catch (error) {
    console.error('❌ Complete profile error:', error);
    res.status(500).json({ error: 'Server error during profile completion' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -verificationToken');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

