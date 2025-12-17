const { ReminderLog } = require('../models');

// Mock notification service - in production, integrate with Twilio/SendGrid
class NotificationService {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
  }

  async sendEmail(to, subject, body) {
    console.log(`📧 Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // Mock implementation - replace with SendGrid in production
    return {
      success: true,
      method: 'email',
      message: `Email sent to ${to}`
    };
  }

  async sendSMS(to, message) {
    console.log(`📱 Sending SMS to ${to}`);
    console.log(`Message: ${message}`);
    
    // Mock implementation - replace with Twilio in production
    return {
      success: true,
      method: 'sms',
      message: `SMS sent to ${to}`
    };
  }

  async sendPushNotification(userId, title, body) {
    console.log(`🔔 Sending push notification to user ${userId}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    
    // Mock implementation - replace with Firebase/OneSignal in production
    return {
      success: true,
      method: 'push',
      message: `Push notification sent to user ${userId}`
    };
  }

  async sendDoseReminder(user, doseSchedule, medication) {
    const message = `Time to take your ${medication.drugName} - ${medication.dosageValue}${medication.dosageUnit}`;
    
    const preferences = user.notificationPreferences;
    const results = [];

    try {
      if (preferences.email && user.email) {
        const result = await this.sendEmail(
          user.email,
          'Medication Reminder',
          message
        );
        
        await this.logReminder(
          user.id,
          doseSchedule.id,
          'dose',
          'email',
          message,
          result.success
        );
        
        results.push(result);
      }

      if (preferences.sms && user.phoneNumber) {
        const result = await this.sendSMS(user.phoneNumber, message);
        
        await this.logReminder(
          user.id,
          doseSchedule.id,
          'dose',
          'sms',
          message,
          result.success
        );
        
        results.push(result);
      }

      if (preferences.push) {
        const result = await this.sendPushNotification(
          user.id,
          'Medication Reminder',
          message
        );
        
        await this.logReminder(
          user.id,
          doseSchedule.id,
          'dose',
          'push',
          message,
          result.success
        );
        
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error sending reminders:', error);
      throw error;
    }
  }

  async sendRefillReminder(user, medication) {
    const message = `Low stock alert: Only ${medication.stockQuantity} doses remaining for ${medication.drugName}. Consider refilling soon.`;
    
    const preferences = user.notificationPreferences;

    try {
      if (preferences.email && user.email) {
        await this.sendEmail(
          user.email,
          'Medication Refill Reminder',
          message
        );
        
        await this.logReminder(
          user.id,
          null,
          'refill',
          'email',
          message,
          true
        );
      }

      if (preferences.sms && user.phoneNumber) {
        await this.sendSMS(user.phoneNumber, message);
        
        await this.logReminder(
          user.id,
          null,
          'refill',
          'sms',
          message,
          true
        );
      }
    } catch (error) {
      console.error('Error sending refill reminder:', error);
      throw error;
    }
  }

  async logReminder(userId, doseScheduleId, reminderType, deliveryMethod, message, success) {
    return await ReminderLog.create({
      userId,
      doseScheduleId,
      reminderType,
      deliveryMethod,
      message,
      status: success ? 'sent' : 'failed',
      sentAt: success ? new Date() : null
    });
  }
}

module.exports = new NotificationService();
