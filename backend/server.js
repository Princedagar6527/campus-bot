import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "./config/db.js";
import Location from "./models/Location.js";
import Notice from "./models/Notice.js";
import ChatLog from "./models/ChatLog.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for standard REST methods
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in backend/.env!");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function: Build Live RAG Knowledge Graph from MongoDB collections
async function getDynamicCampusContext() {
  try {
    const locations = await Location.find({});
    const notices = await Notice.find({}).sort({ date: -1 }).limit(10);

    const locStr = locations
      .map(
        (l) =>
          `- [${l.category}] ${l.name}: ${l.block}, Floor: ${l.floor}, Room: ${l.roomNo}. Details: ${l.description || "N/A"}`
      )
      .join("\n");

    const noticeStr = notices
      .map(
        (n) =>
          `- [${n.category}] ${n.title} (${new Date(n.date).toISOString().split("T")[0]}): ${n.description}`
      )
      .join("\n");

    return `
You are the official autonomous Campus AI Navigator and Helpdesk Assistant for a premier engineering institution.
Your mission is to guide students, visitors, and faculty with precise indoor directions, department details, and live academic updates.

=== LIVE CAMPUS DIRECTORY (MONGODB) ===
${locStr || "No locations currently registered in the database."}

=== RECENT OFFICIAL CIRCULARS & NOTICES ===
${noticeStr || "No active circulars in the database."}

OPERATIONAL GUIDELINES:
1. Provide concise, step-by-step navigation instructions when asked about a room, lab, or office (specify Block, Floor, and Room Number).
2. If a query is outside the provided database facts, state politely: "This information is not registered in our campus records. Please visit the Registrar Helpdesk in the Administrative Block."
3. Maintain a professional, clear, and welcoming tone entirely in English.
`;
  } catch (err) {
    console.error("Context Generation Error:", err);
    return "Campus database context is temporarily unavailable.";
  }
}

// -------------------------------------------------------------
// CHAT ENDPOINT
// -------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A valid message string is required." });
    }

    const systemInstruction = await getDynamicCampusContext();
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(message);
    const replyText = result.response.text();

    // Persist conversation log for auditing and analytics
    await ChatLog.create({ userMessage: message, botReply: replyText }).catch((e) =>
      console.error("ChatLog write error:", e.message)
    );

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    return res.status(500).json({
      reply: "Sorry, the campus assistant could not process your request at this moment. Please try again shortly.",
    });
  }
});

// -------------------------------------------------------------
// NOTICE ENDPOINTS (CRUD)
// -------------------------------------------------------------
app.get("/api/notices", async (req, res) => {
  try {
    const list = await Notice.find({}).sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notices", async (req, res) => {
  try {
    const { title, category, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required." });
    }
    const notice = await Notice.create({ title, category, description });
    console.log("Notice published:", notice._id);
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotice = await Notice.findByIdAndDelete(id);
    if (!deletedNotice) {
      return res.status(404).json({ error: "Notice record not found in database." });
    }
    console.log("Notice deleted:", id);
    return res.status(200).json({ success: true, message: "Notice successfully removed." });
  } catch (err) {
    console.error("Delete Notice Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// LOCATION ENDPOINTS (CRUD)
// -------------------------------------------------------------
app.get("/api/locations", async (req, res) => {
  try {
    const locs = await Location.find({}).sort({ block: 1 });
    res.json(locs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/locations", async (req, res) => {
  try {
    const newLoc = await Location.create(req.body);
    console.log("Location added:", newLoc._id);
    res.status(201).json(newLoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Location record not found in database." });
    }
    console.log("Location deleted:", id);
    return res.status(200).json({ success: true, message: "Location successfully removed." });
  } catch (err) {
    console.error("Delete Location Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// DATABASE SEED ENDPOINT (One-Click Setup)
// -------------------------------------------------------------
app.post("/api/seed", async (req, res) => {
  try {
    await Location.deleteMany({});
    await Notice.deleteMany({});

    await Location.insertMany([
      {
        name: "Computer Science Lab 1 & 2",
        block: "Block A",
        floor: "Ground Floor",
        roomNo: "G-02",
        category: "Lab",
        description: "Equipped with 60 high-performance workstations for Data Structures and Algorithm design.",
        coordinates: { x: 90, y: 150 },
      },
      {
        name: "Department Head Office (CSE HOD)",
        block: "Block A",
        floor: "1st Floor",
        roomNo: "101",
        category: "Faculty",
        description: "Office of the Head of the Computer Science & Engineering Department.",
        coordinates: { x: 120, y: 110 },
      },
      {
        name: "Artificial Intelligence & Cloud Computing Lab",
        block: "Block A",
        floor: "2nd Floor",
        roomNo: "204",
        category: "Lab",
        description: "Specialized GPU computing cluster for Deep Learning and Capstone research projects.",
        coordinates: { x: 150, y: 80 },
      },
      {
        name: "Central University Library",
        block: "Admin Block",
        floor: "2nd Floor",
        roomNo: "LIB-01",
        category: "Facility",
        description: "Includes access to IEEE Xplore digital portals and over 45,000 reference volumes.",
        coordinates: { x: 320, y: 120 },
      },
      {
        name: "Examination & Student Registrar Office",
        block: "Admin Block",
        floor: "Ground Floor",
        roomNo: "ADM-04",
        category: "Admin",
        description: "Handles fee management, academic verification, and hall ticket distributions.",
        coordinates: { x: 300, y: 220 },
      },
      {
        name: "Robotics & Embedded Systems Research Lab",
        block: "Block B",
        floor: "1st Floor",
        roomNo: "B-114",
        category: "Lab",
        description: "Equipped with 3D printers, sensor workbenches, and micro-controller testing kits.",
        coordinates: { x: 210, y: 260 },
      },
    ]);

    await Notice.insertMany([
      {
        title: "Major Capstone Project Synopsis Submission",
        category: "Exam",
        description: "All final-year B.Tech candidates must submit their approved project synopses to Room 101 by Friday.",
      },
      {
        title: "Annual Campus Placement Registration",
        category: "Placement",
        description: "Eligible software engineering applicants must report to Seminar Hall 1 with updated credentials by 9:30 AM.",
      },
    ]);

    console.log("Database initialized with standard English dataset.");
    res.status(200).send("Database initialized successfully!");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Core Server running on http://localhost:${PORT}`);
});