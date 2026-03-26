import Job from '../models/Job.js';
import User from '../models/User.js';

export const createJob = async (req, res) => {
  try {
    const { title, description, budget, jobField, transactionId } = req.body;
    
    if (!title || !description || !budget || !jobField) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const job = new Job({
      title,
      description,
      budget,
      jobField,
      postedBy: req.user.id,
      status: 'open',
      transactionId: transactionId || null
    });

    await job.save();
    
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { jobField, includeAll } = req.query;
    
    let query = includeAll === 'true' ? {} : { status: 'open' };
    
    if (jobField && jobField !== 'All') {
      query.jobField = jobField;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName username email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMatchingJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.jobField) {
      return res.status(400).json({ error: 'Please complete your profile with your job field' });
    }

    const jobs = await Job.find({ 
      status: 'open',
      jobField: user.jobField 
    })
    .populate('postedBy', 'firstName lastName username')
    .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get matching jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId, proposal } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    if (user.role !== 'jobSeeker') {
      return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
    }

    if (!user.jobField) {
      return res.status(400).json({ error: 'Please complete your profile with your job field first' });
    }

    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    if (job.jobField !== user.jobField) {
      return res.status(400).json({ error: `You can only apply for ${user.jobField} jobs` });
    }

    const alreadyApplied = job.applicants.some(
      applicant => applicant.user.toString() === userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    job.applicants.push({ user: userId, proposal });
    await job.save();

    user.appliedJobs.push(jobId);
    await user.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('applicants.user', 'firstName lastName username email jobField')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User appliedJobs:', user?.appliedJobs);
    
    if (!user || !user.appliedJobs || user.appliedJobs.length === 0) {
      console.log('No applied jobs found for user');
      return res.json([]);
    }

    const jobs = await Job.find({ 
      _id: { $in: user.appliedJobs }
    })
    .populate('postedBy', 'firstName lastName username')
    .populate('applicants.user', 'firstName lastName');

    console.log('Found jobs:', jobs.length);
    res.json(jobs || []);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const closeJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({ _id: jobId, postedBy: req.user.id });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    job.status = 'closed';
    await job.save();

    res.json({ message: 'Job closed successfully', job });
  } catch (error) {
    console.error('Close job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await Job.findByIdAndDelete(jobId);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await User.find({ role: 'jobSeeker', profileComplete: true })
      .select('firstName lastName username email jobField certificationImages profilePicture ratings averageRating');

    const jobSeekersWithStats = await Promise.all(
      jobSeekers.map(async (seeker) => {
        const completedJobs = await Job.countDocuments({
          'applicants.user': seeker._id,
          status: 'completed'
        });
        
        return {
          _id: seeker._id,
          firstName: seeker.firstName,
          lastName: seeker.lastName,
          username: seeker.username,
          email: seeker.email,
          jobField: seeker.jobField,
          certificationImages: seeker.certificationImages,
          profilePicture: seeker.profilePicture,
          jobsCompleted: completedJobs,
          ratings: seeker.ratings || [],
          averageRating: seeker.averageRating || 0
        };
      })
    );

    res.json(jobSeekersWithStats);
  } catch (error) {
    console.error('Get job seekers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const acceptApplicant = async (req, res) => {
  try {
    const { jobId, applicantId } = req.body;
    const userId = req.user.id;

    const job = await Job.findOne({ _id: jobId, postedBy: userId });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is not open for applications' });
    }

    const applicantExists = job.applicants.some(
      app => app.user.toString() === applicantId
    );

    if (!applicantExists) {
      return res.status(404).json({ error: 'Applicant not found for this job' });
    }

    job.applicants = job.applicants.map(app => {
      if (app.user.toString() === applicantId) {
        return { ...app.toObject(), status: 'accepted' };
      }
      return { ...app.toObject(), status: 'rejected' };
    });

    job.acceptedApplicant = applicantId;
    await job.save();

    res.json({ 
      message: 'Applicant accepted successfully', 
      job,
      acceptedApplicantId: applicantId 
    });
  } catch (error) {
    console.error('Accept applicant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const rateJobSeeker = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const job = await Job.findOne({ _id: jobId, postedBy: userId });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    if (!job.acceptedApplicant) {
      return res.status(400).json({ error: 'This job has no accepted applicant' });
    }

    if (job.status !== 'completed') {
      job.status = 'completed';
      job.completedAt = new Date();
    }

    const jobSeeker = await User.findById(job.acceptedApplicant);
    
    if (!jobSeeker) {
      return res.status(404).json({ error: 'Job seeker not found' });
    }

    jobSeeker.ratings.push({
      jobId: job._id,
      rating,
      comment: comment || '',
      ratedBy: userId,
      createdAt: new Date()
    });

    const totalRatings = jobSeeker.ratings.length;
    const sumRatings = jobSeeker.ratings.reduce((sum, r) => sum + r.rating, 0);
    jobSeeker.averageRating = Math.round((sumRatings / totalRatings) * 10) / 10;

    await jobSeeker.save();

    const applicantIndex = job.applicants.findIndex(
      app => app.user.toString() === job.acceptedApplicant.toString()
    );
    if (applicantIndex !== -1) {
      job.applicants[applicantIndex].rated = true;
      job.applicants[applicantIndex].rating = rating;
      job.applicants[applicantIndex].ratingComment = comment || '';
    }

    await job.save();

    res.json({ 
      message: 'Rating submitted successfully',
      jobSeeker: {
        _id: jobSeeker._id,
        firstName: jobSeeker.firstName,
        lastName: jobSeeker.lastName,
        averageRating: jobSeeker.averageRating,
        ratings: jobSeeker.ratings
      }
    });
  } catch (error) {
    console.error('Rate job seeker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
