import express from "express";
import {
  createJob,
  getJobs,
  getMatchingJobs,
  applyForJob,
  getMyPostedJobs,
  getMyApplications,
  closeJob
} from "../controllers/jobController.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Create a new job (jobProvider only)
router.post('/', verifyToken, createJob);

// Get all jobs (with optional filtering)
router.get('/', getJobs);

// Get matching jobs for job seeker (based on their jobField)
router.get('/matching', verifyToken, getMatchingJobs);

// Apply for a job (jobSeeker only)
router.post('/apply', verifyToken, applyForJob);

// Get jobs posted by current user (jobProvider)
router.get('/my-posted', verifyToken, getMyPostedJobs);

// Get jobs user has applied to (jobSeeker)
router.get('/my-applications', verifyToken, getMyApplications);

// Close a job (jobProvider only)
router.patch('/:jobId/close', verifyToken, closeJob);

export default router;
