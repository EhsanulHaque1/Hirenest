import express from "express";
import {
  createJob,
  getJobs,
  getMatchingJobs,
  applyForJob,
  getMyPostedJobs,
  getMyApplications,
  closeJob,
  deleteJob,
  getAllJobSeekers
} from "../controllers/jobController.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.post('/', verifyToken, createJob);

router.get('/', getJobs);

router.get('/matching', verifyToken, getMatchingJobs);

router.post('/apply', verifyToken, applyForJob);

router.get('/my-posted', verifyToken, getMyPostedJobs);

router.get('/my-applications', verifyToken, getMyApplications);

router.get('/job-seekers', getAllJobSeekers);

router.patch('/:jobId/close', verifyToken, closeJob);

router.delete('/:jobId', deleteJob);

export default router;
