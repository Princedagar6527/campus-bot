import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema({
  userMessage: { type: String, required: true },
  botReply: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("ChatLog", chatLogSchema);