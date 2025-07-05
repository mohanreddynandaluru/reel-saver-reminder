const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const verifyToken = require("../middlewares/authMiddleware");

// GET /api/notes - Get all notes for current user (Protected route)
router.get("/", verifyToken, async (req, res) => {
  try {
    const userNotes = await Note.find({ userid: req.user.uid })
      .sort({ createdAt: -1 }); // Most recent first

    res.json(userNotes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ 
      message: "Failed to fetch notes", 
      error: err.message 
    });
  }
});

// GET /api/notes/:noteId - Get a specific note (Protected route)
router.get("/:noteId", verifyToken, async (req, res) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userid: req.user.uid });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ 
      message: "Failed to fetch note", 
      error: err.message 
    });
  }
});

// POST /api/notes - Create a new note (Protected route)
router.post("/", verifyToken, async (req, res) => {
  const { note, reminder, url, postDetails, emailNotification, userEmail } = req.body;
  const userid = req.user.uid;

  try {
    // Convert reminder string to Date if provided
    let reminderDate = null;
    if (reminder) {
      reminderDate = new Date(reminder);
      if (isNaN(reminderDate.getTime())) {
        return res.status(400).json({ message: "Invalid reminder date format" });
      }
    }

    // Get user email from Firebase if not provided
    let finalUserEmail = userEmail;
    if (!finalUserEmail) {
      try {
        const admin = require('../firebase');
        const userRecord = await admin.auth().getUser(userid);
        finalUserEmail = userRecord.email;
        // 📧 Fetched user email from Firebase: ${finalUserEmail}
      } catch (error) {
        console.error(`❌ Could not get user email for ${userid}:`, error.message);
        // Continue without email - reminder service will handle this
      }
    }

    const newNote = new Note({
      note: note || "",
      reminder: reminderDate,
      url,
      userid,
      postDetails: postDetails || {},
      isReminderSet: !!reminderDate,
      emailNotification: emailNotification || false,
      userEmail: finalUserEmail
    });

    const savedNote = await newNote.save();
    
            // ✅ Note saved with email: ${finalUserEmail || 'Not available'}
    
    res.status(201).json({ 
      message: "Note saved successfully",
      noteId: savedNote._id,
      note: savedNote
    });
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).json({ 
      message: "Failed to save note", 
      error: err.message 
    });
  }
});

// GET /api/notes/:userId - Get all notes for a user (Protected route)
router.get("/:userId", verifyToken, async (req, res) => {
  const userIdParam = req.params.userId;

  // Verify the user is requesting their own notes
  if (userIdParam !== req.user.uid) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const userNotes = await Note.find({ userid: userIdParam })
      .sort({ createdAt: -1 }); // Most recent first

    res.json(userNotes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ 
      message: "Failed to fetch notes", 
      error: err.message 
    });
  }
});

// DELETE /api/notes/:noteId - Delete a note (Protected route)
router.delete("/:noteId", verifyToken, async (req, res) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userid: req.user.uid });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await Note.findByIdAndDelete(noteId);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ 
      message: "Failed to delete note", 
      error: err.message 
    });
  }
});

// PUT /api/notes/:noteId - Update a note (Protected route)
router.put("/:noteId", verifyToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { note, reminder, postDetails, emailNotification } = req.body;

  try {
    const existingNote = await Note.findOne({ _id: noteId, userid: req.user.uid });
    
    if (!existingNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Convert reminder string to Date if provided
    let reminderDate = null;
    if (reminder) {
      reminderDate = new Date(reminder);
      if (isNaN(reminderDate.getTime())) {
        return res.status(400).json({ message: "Invalid reminder date format" });
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        note: note !== undefined ? note : existingNote.note,
        reminder: reminderDate,
        postDetails: postDetails || existingNote.postDetails,
        isReminderSet: !!reminderDate,
        emailNotification: emailNotification !== undefined ? emailNotification : existingNote.emailNotification
      },
      { new: true }
    );

    res.json({ 
      message: "Note updated successfully",
      note: updatedNote
    });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ 
      message: "Failed to update note", 
      error: err.message 
    });
  }
});

module.exports = router;
