import User from '../models/User.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import fs from 'fs';

// Environment-based logging
const isDev = process.env.NODE_ENV === 'development';
const log = {
  info: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => isDev && console.warn(...args),
};

import mongoose from 'mongoose';

export const getProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .select('-passwordHash -verificationToken -verificationToken -verificationTokenExpires');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const completeProfile = async (req, res) => {
  try {
    console.log('Profile complete request:', {
      role: req.user.role,
      hasNidImages: req.files && req.files['nidImages'] ? req.files['nidImages'].length : 0,
      hasCerts: req.files && req.files['certificationImages'] ? req.files['certificationImages'].length : 0,
      hasProfilePicture: req.files && req.files['profilePicture'] ? 1 : 0,
    });

    const userId = req.user.id;
    const { jobField, firstName, lastName } = req.body;
    let updateData = { profileComplete: true };

    if (firstName) {
      updateData.firstName = firstName;
    }
    if (lastName) {
      updateData.lastName = lastName;
    }

    const profilePicFile = req.files && req.files['profilePicture'];
    if (profilePicFile && profilePicFile.length > 0) {
      const profilePicUrl = await uploadToCloudinary(profilePicFile[0]);
      console.log('✅ Profile picture uploaded:', profilePicUrl);
      updateData.profilePicture = profilePicUrl;
    }

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
      try {
        // Parse JSON string if needed (frontend sends JSON.stringify(array))
        updateData.jobField = typeof jobField === 'string' ? JSON.parse(jobField) : jobField;
        console.log('📋 JobField:', updateData.jobField);
      } catch (parseError) {
        console.error('❌ JobField parse error:', parseError);
        return res.status(400).json({ error: 'Invalid jobField format' });
      }
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

export const updateProfile = async (req, res, next) => {
  const uploadedFiles = []; // Track uploaded files for cleanup
  
  try {
    // DEBUG: Log everything to identify the issue (dev only)
    log.info('=== PROFILE UPDATE DEBUG ===');
    log.info('USER:', req.user);
    log.info('BODY:', req.body);
    log.info('FILES:', req.files);
    log.info('========================');

    const userId = req.user?.id;
    if (!userId) {
      log.error('❌ No user ID found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { firstName, lastName, experience, education, jobField } = req.body;
    let updateData = {};

    // Safe partial updates - only update fields that are provided
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Safe JSON parsing helper function
    const safeParse = (data, fieldName) => {
      if (data === undefined) return undefined;
      if (data === null) return null;
      
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (parseError) {
        log.error(`❌ JSON parse error for ${fieldName}:`, parseError);
        throw new Error(`Invalid JSON format for ${fieldName}`);
      }
    };

    // Safe JSON parsing for array fields
    if (jobField !== undefined) {
      updateData.jobField = safeParse(jobField, 'jobField');
    }

    if (experience !== undefined) {
      updateData.experience = safeParse(experience, 'experience');
    }

    if (education !== undefined) {
      updateData.education = safeParse(education, 'education');
    }

    // Handle profile picture upload with error handling
    const profilePic = req.files?.profilePicture?.[0];
    if (profilePic) {
      try {
        log.info('📤 Uploading profile picture...');
        const profilePicUrl = await uploadToCloudinary(profilePic);
        log.info('✅ Profile picture uploaded:', profilePicUrl);
        updateData.profilePicture = profilePicUrl;
        uploadedFiles.push(profilePic.path);
      } catch (uploadError) {
        log.error('❌ Profile picture upload failed:', uploadError);
        return res.status(500).json({ error: 'Profile picture upload failed: ' + uploadError.message });
      }
    }

    // Handle certification images upload with deduplication
    const certImages = req.files?.certificationImages || [];
    if (certImages.length > 0) {
      try {
        log.info('📤 Uploading certification images...');
        const certUrls = await Promise.all(
          certImages.map(file => {
            uploadedFiles.push(file.path);
            return uploadToCloudinary(file);
          })
        );
        log.info('✅ Certs uploaded:', certUrls);
        
        // Append to existing certifications and deduplicate by URL
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const existingCerts = user.certificationImages || [];
        const allCerts = [...existingCerts, ...certUrls];
        updateData.certificationImages = [...new Set(allCerts)]; // Remove duplicates
      } catch (uploadError) {
        log.error('❌ Certification upload failed:', uploadError);
        return res.status(500).json({ error: 'Certification image upload failed: ' + uploadError.message });
      }
    }

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      log.warn('⚠️ No data to update');
      return res.status(400).json({ error: 'No data provided for update' });
    }

    log.info('📝 Updating user with data:', updateData);

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash -verificationToken');

    if (!user) {
      log.error('❌ User not found after update');
      return res.status(404).json({ error: 'User not found' });
    }

    log.info('✅ Profile updated successfully for user:', user.username);

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    log.error('❌ UPDATE PROFILE ERROR:', error);
    log.error('Error stack:', error.stack);
    
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return res.status(400).json({ error: 'Invalid JSON format in request data: ' + error.message });
    }
    
    // Pass error to centralized error handler
    next(error);
  } finally {
    // Clean up uploaded files (prevent memory leaks)
    uploadedFiles.forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          log.info('🗑️ Cleaned up file:', filePath);
        } catch (cleanupError) {
          log.error('❌ File cleanup failed:', cleanupError);
        }
      }
    });
  }
};

