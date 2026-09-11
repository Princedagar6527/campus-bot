import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  block: { type: String, required: true }, // e.g., "Block A", "Block B"
  floor: { type: String, required: true }, // e.g., "Ground Floor", "1st Floor"
  roomNo: { type: String, required: true },
  category: { type: String, enum: ["Lab", "Faculty", "Admin", "Facility", "Classroom"], required: true },
  description: { type: String },
  coordinates: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 }
  }
}, { timestamps: true });

export default mongoose.model("Location", locationSchema);