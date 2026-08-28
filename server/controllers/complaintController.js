import Complaint from "../models/Complaint.js";

export const submitComplaint = async (req, res) => {
  const { complaintText } = req.body;
  const userId = req.user.id;

  if (!complaintText) {
    return res.status(400).json({ error: "Missing complaintText" });
  }

  try {
    const complaint = new Complaint({
      userId,
      complaintText,
    });

    await complaint.save();

    return res
      .status(201)
      .json({ message: "Complaint submitted successfully" });
  } catch (error) {
    console.error("Submit complaint error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate(
      "userId",
      "firstName lastName email username",
    );
    return res.status(200).json(complaints);
  } catch (error) {
    console.error("Get complaints error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
