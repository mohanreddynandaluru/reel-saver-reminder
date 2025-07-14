const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Note = require('./models/note');
const admin = require('./firebase');

// Email transporter configuration
let transporter = null;

// Only create transporter if email credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  // Email service configured
} else {
  // Email credentials not found. Email notifications will be disabled.
}

// Schedule reminder check every minute
cron.schedule('* * * * *', async () => {
  await checkAndSendReminders();
});

async function checkAndSendReminders() {
  try {
    const now = new Date();
    const dueReminders = await Note.find({
      isReminderSet: true,
      reminderTriggered: false,
      reminder: { $lte: now },
      reminderAttempts: { $lt: 3 } // Max 3 attempts
    });

    for (const reminder of dueReminders) {
      await sendReminder(reminder);
    }
  } catch (error) {
    // Error checking reminders
  }
}

async function sendReminder(note) {
  try {
    // Update attempt count
    note.reminderAttempts += 1;
    note.lastReminderAttempt = new Date();
    await note.save();

    let userEmail = note.userEmail;
    if (!userEmail && note.emailNotification) {
      try {
        const userRecord = await admin.auth().getUser(note.userid);
        userEmail = userRecord.email;
        note.userEmail = userEmail;
        await note.save();
      } catch (error) {
        userEmail = null;
      }
    }

    if (userEmail && note.emailNotification) {
      await sendEmailNotification(note, userEmail);
      note.reminderSent = true;
    } else if (userEmail && !note.emailNotification) {
      // Email notification disabled for note _id=${note._id}
    } else {
      // No email address found for note _id=${note._id} - using browser notifications only
    }

    note.reminderTriggered = true;
    await note.save();

  } catch (error) {
    if (note.reminderAttempts >= 3) {
      note.reminderTriggered = true;
      await note.save();
    }
  }
}

async function sendEmailNotification(note, userEmail) {
  if (!transporter) {
    return;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0095f6;">Instagram Note Reminder</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Note:</h3>
        <p style="font-size: 16px; color: #333;">${note.note || 'No note added'}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <p><strong>Instagram Post:</strong></p>
        <a href="${note.url}" style="color: #0095f6; text-decoration: none;">${note.url}</a>
      </div>
      
      ${note.postDetails.caption ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Post Caption:</strong></p>
          <p style="color: #856404;">${note.postDetails.caption.substring(0, 200)}${note.postDetails.caption.length > 200 ? '...' : ''}</p>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${note.url}" style="background: #0095f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Instagram Post
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This reminder was set on ${new Date(note.createdAt).toLocaleDateString()}
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Instagram Note Reminder',
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}

// Function to manually trigger a reminder (for testing)
async function triggerReminder(noteId) {
  try {
    const note = await Note.findById(noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    
    await sendReminder(note);
    return { success: true, message: 'Reminder triggered successfully' };
  } catch (error) {
    console.error('Error triggering reminder:', error);
    return { success: false, error: error.message };
  }
}

// Function to get upcoming reminders for a user
async function getUpcomingReminders(userId) {
  try {
    const now = new Date();
    const upcomingReminders = await Note.find({
      userid: userId,
      isReminderSet: true,
      reminderTriggered: false,
      reminder: { $gt: now }
    }).sort({ reminder: 1 });

    return upcomingReminders;
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    throw error;
  }
}

module.exports = {
  checkAndSendReminders,
  sendReminder,
  triggerReminder,
  getUpcomingReminders
}; 