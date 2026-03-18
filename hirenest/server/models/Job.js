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
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    applicants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      proposal: { type: String },
      appliedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
