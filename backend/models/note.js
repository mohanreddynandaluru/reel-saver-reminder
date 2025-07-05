const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    reminder: { type: Date },
    url: { type: String, required: true },
    userid: { type: String, required: true },
    postDetails: {
      type: { type: String, enum: ["post", "reel", "igtv", "unknown"], default: "unknown" },
      caption: { type: String, default: "" },
      author: { type: String, default: "" }
    },
    isReminderSet: { type: Boolean, default: false },
    reminderTriggered: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: false },
    userEmail: { type: String },
    reminderAttempts: { type: Number, default: 0 },
    lastReminderAttempt: { type: Date }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
