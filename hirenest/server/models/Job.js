import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: String, required: true },
    jobField: {
      type: String,
      enum: ['Web Development', 'App Development', 'UI/UX Design', 'Marketing'],
      required: true
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed', 'completed'], default: 'open' },
    acceptedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    transactionId: { type: String },
    applicants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      proposal: { type: String },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      rated: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      ratingComment: { type: String },
      appliedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
