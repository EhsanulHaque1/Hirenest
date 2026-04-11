import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['newMessage', 'applicationAccepted', 'jobAccepted', 'newApplicant'],
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedType'
  },
  relatedType: {
    type: String,
    enum: ['Chat', 'Job', 'Payment']
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;