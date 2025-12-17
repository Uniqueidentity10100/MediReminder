const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReminderLog = sequelize.define('ReminderLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  doseScheduleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'dose_schedules',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  reminderType: {
    type: DataTypes.ENUM('dose', 'refill', 'appointment'),
    allowNull: false
  },
  deliveryMethod: {
    type: DataTypes.ENUM('email', 'sms', 'push'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reminder_logs',
  indexes: [
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = ReminderLog;
