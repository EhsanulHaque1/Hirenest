import express from 'express';
import {
  initializePayment,
  handlePaymentSuccess,
  handlePaymentFail,
  handlePaymentCancel,
  handlePaymentIPN,
  getPaymentStatus,
  getClosedJobsForPayment,
  getAdminTransactions,
  initializeAdminPayment,
  handleAdminPaymentSuccess,
  handleAdminPaymentFail,
  handleAdminPaymentCancel,
  handleAdminPaymentIPN
} from '../controllers/paymentController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.post('/initialize', verifyToken, initializePayment);

router.post('/success', handlePaymentSuccess);
router.post('/fail', handlePaymentFail);
router.post('/cancel', handlePaymentCancel);
router.post('/ipn', handlePaymentIPN);

router.get('/status/:transactionId', verifyToken, getPaymentStatus);

router.get('/posting-fee', (req, res) => {
  const fee = parseInt(process.env.JOB_POSTING_FEE) || 100;
  res.json({ fee });
});

// Admin payment routes
router.get('/admin/closed-jobs', verifyToken, getClosedJobsForPayment);
router.get('/admin/transactions', verifyToken, getAdminTransactions);
router.post('/admin/initialize-payment', verifyToken, initializeAdminPayment);
router.post('/admin/payment/success', handleAdminPaymentSuccess);
router.post('/admin/payment/fail', handleAdminPaymentFail);
router.post('/admin/payment/cancel', handleAdminPaymentCancel);
router.post('/admin/payment/ipn', handleAdminPaymentIPN);

export default router;
