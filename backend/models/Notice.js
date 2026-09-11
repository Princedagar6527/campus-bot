import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "General" }, // "Exam", "Placement", "Holiday"
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Notice", noticeSchema);