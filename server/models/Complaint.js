import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaintText: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    resolutionMessage: { type: String, trim: true },
  },
  { timestamps: true },
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
