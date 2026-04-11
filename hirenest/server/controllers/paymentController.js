import Payment from '../models/Payment.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { createNotification } from './notificationController.js';

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
const IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
const JOB_POSTING_FEE = parseInt(process.env.JOB_POSTING_FEE) || 100;

const SSLCOMMERZ_API_URL = IS_SANDBOX 
  ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

const SSLCOMMERZ_VALIDATION_URL = IS_SANDBOX
  ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

export const initializePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobData } = req.body;

    if (!jobData || !jobData.title || !jobData.description || !jobData.budget || !jobData.jobField) {
      return res.status(400).json({ error: 'Invalid job data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let budgetAmount = 0;
    const budgetStr = jobData.budget.toString();
    const numbers = budgetStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      budgetAmount = parseInt(numbers[0], 10);
    }

    const totalAmount = JOB_POSTING_FEE + budgetAmount;

    const transactionId = `JOB_${Date.now()}_${userId.toString().slice(-6)}`;

    const payment = new Payment({
      userId,
      amount: totalAmount,
      currency: 'BDT',
      status: 'pending',
      transactionId,
      jobData
    });
    await payment.save();

    const formData = new FormData();
    formData.append('store_id', STORE_ID);
    formData.append('store_passwd', STORE_PASSWORD);
    formData.append('total_amount', totalAmount.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', transactionId);
    formData.append('success_url', `http://localhost:5004/api/payments/success?tran_id=${transactionId}&jobData=${encodeURIComponent(JSON.stringify(jobData))}`);
    formData.append('fail_url', `http://localhost:5004/api/payments/fail?tran_id=${transactionId}`);
    formData.append('cancel_url', `http://localhost:5004/api/payments/cancel?tran_id=${transactionId}`);
    formData.append('ipn_url', `http://localhost:5004/api/payments/ipn`);
    formData.append('product_name', 'Job Posting Fee');
    formData.append('product_category', 'Service');
    formData.append('product_profile', 'non-physical-goods');
    formData.append('cus_name', `${user.firstName} ${user.lastName}`);
    formData.append('cus_email', user.email);
    formData.append('cus_add1', 'Dhaka');
    formData.append('cus_city', 'Dhaka');
    formData.append('cus_country', 'Bangladesh');
    formData.append('cus_phone', user.phone || '01700000000');
    formData.append('shipping_method', 'NO');
    formData.append('num_of_item', '1');
    formData.append('product_amount', JOB_POSTING_FEE.toString());
    formData.append('vat', '0');
    formData.append('discount_amount', '0');

    console.log('Sending to SSLCommerz API:', SSLCOMMERZ_API_URL);
    console.log('Key payment fields:');
    console.log('  store_id:', STORE_ID);
    console.log('  tran_id:', transactionId);
    console.log('  total_amount:', JOB_POSTING_FEE);
    
    const response = await fetch(SSLCOMMERZ_API_URL, {
      method: 'POST',
      body: formData
    });

    console.log('SSLCommerz Response Status:', response.status);
    const result = await response.json();
    console.log('SSLCommerz Response:', JSON.stringify(result, null, 2));
    console.log('SSLCommerz status:', result.status);
    console.log('SSLCommerz failedreason:', result.failedreason);
    console.log('SSLCommerz error:', result.error);

    if (result.status === 'SUCCESS' && result.GatewayPageURL) {
      res.json({
        success: true,
        paymentUrl: result.GatewayPageURL,
        transactionId
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      console.error('SSLCommerz Error Response:', result);
      res.status(400).json({
        success: false,
        error: result.failedreason || result.error || result.message || 'Payment initialization failed'
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    res.status(500).json({ 
      error: 'Server error during payment initialization',
      details: error.message 
    });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;
    const valId = req.query.val_id || req.body.val_id;
    const jobDataParam = req.query.jobData || req.body.jobData;

    if (!tranId) {
      return res.redirect(`http://localhost:5173/payment-fail?error=Invalid transaction`);
    }

    let jobData = null;
    if (jobDataParam) {
      try {
        jobData = JSON.parse(decodeURIComponent(jobDataParam));
      } catch (e) {
        console.error('Failed to parse jobData:', e);
      }
    }

    let payment = await Payment.findOne({ transactionId: tranId });
    
    if (!payment && jobData) {
      let budgetAmount = 0;
      const budgetStr = jobData.budget ? jobData.budget.toString() : '';
      const numbers = budgetStr.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        budgetAmount = parseInt(numbers[0], 10);
      }
      const totalAmount = JOB_POSTING_FEE + budgetAmount;

      payment = new Payment({
        userId: req.user?.id,
        transactionId: tranId,
        amount: totalAmount,
        currency: 'BDT',
        status: 'completed',
        jobData
      });
      await payment.save();
    }

    if (payment) {
      payment.status = 'completed';
      await payment.save();

      if (jobData && !payment.jobId) {
        const job = new Job({
          ...jobData,
          postedBy: payment.userId,
          paymentId: payment._id,
          transactionId: tranId,
          status: 'open'
        });
        await job.save();
        payment.jobId = job._id;
        await payment.save();
      }

      return res.redirect(`http://localhost:5173/payment-success?tran_id=${tranId}&job_title=${encodeURIComponent(jobData?.title || '')}`);
    } else {
      return res.redirect(`http://localhost:5173/payment-fail?error=Payment not found`);
    }
  } catch (error) {
    console.error('Payment success handler error:', error);
    return res.redirect(`http://localhost:5173/payment-fail?error=Server error`);
  }
};

export const handlePaymentFail = async (req, res) => {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;

    if (tranId) {
      const payment = await Payment.findOne({ transactionId: tranId });
      if (payment && payment.status === 'pending') {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.redirect(`http://localhost:5173/payment-fail?tran_id=${tranId || ''}`);
  } catch (error) {
    console.error('Payment fail handler error:', error);
    res.redirect('http://localhost:5173/payment-fail');
  }
};

export const handlePaymentCancel = async (req, res) => {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;

    if (tranId) {
      const payment = await Payment.findOne({ transactionId: tranId });
      if (payment && payment.status === 'pending') {
        payment.status = 'cancelled';
        await payment.save();
      }
    }

    res.redirect(`http://localhost:5173/payment-cancel?tran_id=${tranId || ''}`);
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.redirect('http://localhost:5173/payment-cancel');
  }
};

export const handlePaymentIPN = async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body;

    if (!tran_id) {
      return res.status(400).send('Invalid IPN data');
    }

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (!payment) {
      return res.status(404).send('Payment not found');
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      if (payment.status === 'pending') {
        const validationUrl = `${SSLCOMMERZ_VALIDATION_URL}?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&format=json`;
        const validationResponse = await fetch(validationUrl);
        const validationData = await validationResponse.json();

        if (validationData.status === 'VALID' || validationData.status === 'VALIDATED') {
          payment.status = 'completed';
          payment.sslcommerzData = validationData;
          await payment.save();

          if (!payment.jobId) {
            const job = new Job({
              ...payment.jobData,
              postedBy: payment.userId,
              paymentId: payment._id
            });
            await job.save();

            payment.jobId = job._id;
            await payment.save();
          }
        }
      }
    }

    res.status(200).send('IPN processed');
  } catch (error) {
    console.error('IPN handler error:', error);
    res.status(500).send('Server error');
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ 
      transactionId, 
      userId 
    }).populate('jobId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      jobId: payment.jobId,
      createdAt: payment.createdAt
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin Payment Endpoints

export const getClosedJobsForPayment = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Find all closed jobs that haven't been paid yet
    // Get all job IDs that have completed or pending admin payments
    // Failed or cancelled payments should not exclude jobs from pending list
    const paidJobIds = await Payment.distinct('jobId', { 
      paymentType: 'adminPayment',
      status: { $in: ['completed', 'pending'] }
    });
    
    // Find all closed or completed jobs that are NOT in the paidJobIds list
    // This includes jobs with or without acceptedApplicant
    const closedJobs = await Job.find({ 
      status: { $in: ['closed', 'completed'] },
      _id: { $nin: paidJobIds }
    })
    .populate('postedBy', 'firstName lastName email username')
    .populate('acceptedApplicant', 'firstName lastName email username')
    .sort({ updatedAt: -1 });

    res.json(closedJobs);
  } catch (error) {
    console.error('Get closed jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminTransactions = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Find all admin payments
    const transactions = await Payment.find({ 
      paymentType: 'adminPayment'
    })
    .populate('jobId', 'title')
    .populate('recipientId', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get admin transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const initializeAdminPayment = async (req, res) => {
  try {
    const { jobId } = req.body;
    const adminId = req.user.id;

    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const job = await Job.findById(jobId)
      .populate('postedBy', 'firstName lastName email username phone')
      .populate('acceptedApplicant', 'firstName lastName email username phone');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'closed' && job.status !== 'completed') {
      return res.status(400).json({ error: 'Job is not closed or completed' });
    }

    // Check if payment already exists for this job
    const existingPayment = await Payment.findOne({
      jobId,
      paymentType: 'adminPayment',
      status: { $in: ['completed', 'pending'] }
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already processed for this job' });
    }

    // Determine recipient based on whether an applicant was accepted
    let recipient;
    let recipientType;
    if (job.acceptedApplicant) {
      recipient = job.acceptedApplicant;
      recipientType = 'jobSeeker';
    } else {
      recipient = job.postedBy;
      recipientType = 'jobProvider';
    }

    // Extract budget amount (excluding posting fee)
    let budgetAmount = 0;
    const budgetStr = job.budget.toString();
    const numbers = budgetStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      budgetAmount = parseInt(numbers[0], 10);
    }

    if (budgetAmount <= 0) {
      return res.status(400).json({ error: 'Invalid job budget' });
    }

    const transactionId = `ADMIN_${Date.now()}_${jobId.toString().slice(-6)}`;

    const payment = new Payment({
      jobId,
      amount: budgetAmount,
      currency: 'BDT',
      status: 'pending',
      transactionId,
      paymentType: 'adminPayment',
      recipientType,
      recipientId: recipient._id,
      jobData: {
        title: job.title,
        description: job.description,
        budget: job.budget,
        jobField: job.jobField
      }
    });
    await payment.save();

    const formData = new FormData();
    formData.append('store_id', STORE_ID);
    formData.append('store_passwd', STORE_PASSWORD);
    formData.append('total_amount', budgetAmount.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', transactionId);
    formData.append('success_url', `http://localhost:5004/api/payments/admin/payment/success?tran_id=${transactionId}&jobId=${jobId}`);
    formData.append('fail_url', `http://localhost:5004/api/payments/admin/payment/fail?tran_id=${transactionId}`);
    formData.append('cancel_url', `http://localhost:5004/api/payments/admin/payment/cancel?tran_id=${transactionId}`);
    formData.append('ipn_url', `http://localhost:5004/api/payments/admin/payment/ipn`);
    formData.append('product_name', `Payment for Job: ${job.title}`);
    formData.append('product_category', 'Service');
    formData.append('product_profile', 'non-physical-goods');
    formData.append('cus_name', `${recipient.firstName} ${recipient.lastName}`);
    formData.append('cus_email', recipient.email);
    formData.append('cus_add1', 'Dhaka');
    formData.append('cus_city', 'Dhaka');
    formData.append('cus_country', 'Bangladesh');
    formData.append('cus_phone', recipient.phone || '01700000000');
    formData.append('shipping_method', 'NO');
    formData.append('num_of_item', '1');
    formData.append('product_amount', budgetAmount.toString());
    formData.append('vat', '0');
    formData.append('discount_amount', '0');

    console.log('Sending admin payment to SSLCommerz API:', SSLCOMMERZ_API_URL);
    console.log('Admin payment fields:');
    console.log('  store_id:', STORE_ID);
    console.log('  tran_id:', transactionId);
    console.log('  total_amount:', budgetAmount);
    console.log('  recipient:', recipient.firstName, recipient.lastName);
    console.log('  recipientType:', recipientType);
    console.log('  STORE_ID exists:', !!STORE_ID);
    console.log('  STORE_PASSWORD exists:', !!STORE_PASSWORD);

    const response = await fetch(SSLCOMMERZ_API_URL, {
      method: 'POST',
      body: formData
    });

    console.log('SSLCommerz Response Status:', response.status);
    const result = await response.json();
    console.log('SSLCommerz Response:', JSON.stringify(result, null, 2));

    if (result.status === 'SUCCESS' && result.GatewayPageURL) {
      res.json({
        success: true,
        paymentUrl: result.GatewayPageURL,
        transactionId
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      console.error('SSLCommerz Error Response:', result);
      res.status(400).json({
        success: false,
        error: result.failedreason || result.error || result.message || 'Payment initialization failed'
      });
    }
  } catch (error) {
    console.error('Admin payment initialization error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    res.status(500).json({ 
      error: 'Server error during payment initialization',
      details: error.message 
    });
  }
};

export const handleAdminPaymentSuccess = async (req, res) => {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;
    const valId = req.query.val_id || req.body.val_id;
    const jobId = req.query.jobId || req.body.jobId;

    if (!tranId) {
      return res.redirect(`http://localhost:5173/admin-payment?error=Invalid transaction`);
    }

    const payment = await Payment.findOne({ transactionId: tranId });
    
    if (payment) {
      payment.status = 'completed';
      await payment.save();

      return res.redirect(`http://localhost:5173/admin-payment?success=true&tran_id=${tranId}`);
    } else {
      return res.redirect(`http://localhost:5173/admin-payment?error=Payment not found`);
    }
  } catch (error) {
    console.error('Admin payment success handler error:', error);
    return res.redirect(`http://localhost:5173/admin-payment?error=Server error`);
  }
};

export const handleAdminPaymentFail = async (req, res) => {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;

    if (tranId) {
      const payment = await Payment.findOne({ transactionId: tranId });
      if (payment && payment.status === 'pending') {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.redirect(`http://localhost:5173/admin-payment?error=Payment failed&tran_id=${tranId || ''}`);
  } catch (error) {
    console.error('Admin payment fail handler error:', error);
    res.redirect('http://localhost:5173/admin-payment?error=Server error');
  }
};

export const handleAdminPaymentCancel = async (req, res) => {
  try {
    const tranId = req.query.tran_id || req.body.tran_id;

    if (tranId) {
      const payment = await Payment.findOne({ transactionId: tranId });
      if (payment && payment.status === 'pending') {
        payment.status = 'cancelled';
        await payment.save();
      }
    }

    res.redirect(`http://localhost:5173/admin-payment?error=Payment cancelled&tran_id=${tranId || ''}`);
  } catch (error) {
    console.error('Admin payment cancel handler error:', error);
    res.redirect('http://localhost:5173/admin-payment?error=Server error');
  }
};

export const handleAdminPaymentIPN = async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body;

    if (!tran_id) {
      return res.status(400).send('Invalid IPN data');
    }

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (!payment) {
      return res.status(404).send('Payment not found');
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      if (payment.status === 'pending') {
        const validationUrl = `${SSLCOMMERZ_VALIDATION_URL}?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&format=json`;
        const validationResponse = await fetch(validationUrl);
        const validationData = await validationResponse.json();

        if (validationData.status === 'VALID' || validationData.status === 'VALIDATED') {
          payment.status = 'completed';
          payment.sslcommerzData = validationData;
          await payment.save();
        }
      }
    }

    res.status(200).send('IPN processed');
  } catch (error) {
    console.error('Admin IPN handler error:', error);
    res.status(500).send('Server error');
  }
};
