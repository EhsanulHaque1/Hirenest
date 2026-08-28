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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    nidImages: [{ type: String }],
    certificationImages: [{ type: String }],
    profilePicture: { type: String },
    jobField: [
      {
        type: String,
        enum: [
          "Web Development",
          "App Development",
          "UI/UX Design",
          "Marketing",
        ],
      },
    ],
    experience: [
      {
        company: { type: String, trim: true },
        position: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String, trim: true },
        isCurrent: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        fieldOfStudy: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String, trim: true },
      },
    ],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    ratings: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
