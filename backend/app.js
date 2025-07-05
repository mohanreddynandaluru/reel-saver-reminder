// Load environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const notesRouter = require("./routes/notes");

// Import reminder service
const reminderService = require('./reminderService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/insta-notes";
mongoose.connect(mongoUri)
  .then(() => {
  // ✅ Connected to MongoDB
})
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Routes
app.use("/api/notes", notesRouter);

// Reminder management routes
app.get("/api/reminders/upcoming", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const upcomingReminders = await reminderService.getUpcomingReminders(userId);
    res.json(upcomingReminders);
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

// Test endpoint to trigger a reminder manually
app.post("/api/reminders/trigger/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const result = await reminderService.triggerReminder(noteId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error triggering reminder:", error);
    res.status(500).json({ message: "Failed to trigger reminder" });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  // 🚀 Server running on port ${PORT}
  // ⏰ Reminder service started - checking every minute
});
