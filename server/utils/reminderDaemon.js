import HealthSchedule from '../models/HealthSchedule.js';
import { sendEmail } from '../config/nodemailer.js';

export const startReminderDaemon = () => {
  console.log('⏰ PawLink Email Reminder Daemon Started successfully.');

  // Run the check every 60 seconds
  setInterval(async () => {
    try {
      const now = new Date();

      // Find all reminders that are Pending or Overdue, are past their due date,
      // and haven't had an email reminder sent out yet.
      const overdueReminders = await HealthSchedule.find({
        reminderStatus: { $in: ['Pending', 'Overdue'] },
        dueDate: { $lte: now },
        emailSent: { $ne: true }
      }).populate('owner');

      for (const reminder of overdueReminders) {
        if (!reminder.owner || !reminder.owner.email) {
          console.warn(`Skipping reminder ${reminder._id} because owner or email is missing.`);
          continue;
        }

        const ownerEmail = reminder.owner.email;
        const ownerName = reminder.owner.name || 'Pet Owner';
        
        const eventDateStr = reminder.dueDate.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        });

        const emailSubject = `⏰ Alert: Reminder for ${reminder.petName}'s ${reminder.type} is Due!`;
        const emailText = `Hello ${ownerName},\n\nThis is a scheduled health reminder for your pet ${reminder.petName}:\n\nReminder: ${reminder.title}\nType: ${reminder.type}\nDue Date/Time: ${eventDateStr}\n${reminder.vetName ? `Veterinarian: ${reminder.vetName}\n` : ''}${reminder.notes ? `Notes: ${reminder.notes}\n` : ''}\nPlease mark this event as completed in your PawLink Health Scheduler dashboard once finished.\n\nBest regards,\nThe PawLink Team`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; color: #1e293b; background-color: #ffffff;">
            <h2 style="color: #4f46e5; margin-top: 0; display: flex; items-center: center; gap: 8px;">
              ⏰ PawLink Health Reminder
            </h2>
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>This is a scheduled event notification for your pet, <strong>${reminder.petName}</strong>, which is now due.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; margin-bottom: 12px; color: #0f172a;">Event Details</h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #334155;">
                <li><strong>Pet Name:</strong> ${reminder.petName}</li>
                <li><strong>Reminder Type:</strong> ${reminder.type}</li>
                <li><strong>Task Description:</strong> ${reminder.title}</li>
                <li><strong>Scheduled Date & Time:</strong> ${eventDateStr}</li>
                ${reminder.vetName ? `<li><strong>Assigned Vet:</strong> ${reminder.vetName}</li>` : ''}
                ${reminder.notes ? `<li><strong>Notes:</strong> ${reminder.notes}</li>` : ''}
              </ul>
            </div>
            
            <p>Please update the status to <strong>Completed</strong> in your PawLink account once this task is completed.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 0.8em; color: #64748b; margin-bottom: 0;">This is an automated system notification from PawLink. Thank you for taking care of your pets!</p>
          </div>
        `;

        console.log(`[Daemon] Sending scheduled email reminder for "${reminder.title}" to owner: ${ownerEmail}...`);
        const sentResult = await sendEmail(ownerEmail, emailSubject, emailText, emailHtml);
        
        if (sentResult) {
          reminder.emailSent = true;
          reminder.reminderStatus = 'Overdue';
          await reminder.save();
          console.log(`[Daemon] Successfully processed and marked reminder "${reminder.title}" as sent.`);
        } else {
          console.error(`[Daemon] Failed to send email reminder for "${reminder.title}". Will retry on next check.`);
        }
      }
    } catch (error) {
      console.error('[Daemon] Error running email scheduler checks:', error.message);
    }
  }, 60000);
};
