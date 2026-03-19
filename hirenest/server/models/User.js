import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["jobSeeker", "jobProvider"], required: true },
    isVerified: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    nidImages: [{ type: String }], 
    certificationImages: [{ type: String }], 
    jobField: { 
      type: String, 
      enum: ['Web Development', 'App Development', 'UI/UX Design', 'Marketing'],
      required: false 
    },
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;

