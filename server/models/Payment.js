import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job' 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'BDT' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: { 
    type: String,
    unique: true,
    required: true
  },
  sslcommerzData: {
    type: mongoose.Schema.Types.Mixed
  },
  jobData: {
    type: mongoose.Schema.Types.Mixed
  },
  paymentType: {
    type: String,
    enum: ['jobPosting', 'adminPayment'],
    default: 'jobPosting'
  },
  recipientType: {
    type: String,
    enum: ['jobProvider', 'jobSeeker', 'admin'],
    default: 'admin'
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
