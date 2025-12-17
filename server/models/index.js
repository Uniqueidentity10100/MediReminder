const User = require('./User');
const Medication = require('./Medication');
const DoseSchedule = require('./DoseSchedule');
const ReminderLog = require('./ReminderLog');

// Define associations
User.hasMany(Medication, {
  foreignKey: 'userId',
  as: 'medications'
});

Medication.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Medication.hasMany(DoseSchedule, {
  foreignKey: 'medicationId',
  as: 'schedules'
});

DoseSchedule.belongsTo(Medication, {
  foreignKey: 'medicationId',
  as: 'medication'
});

User.hasMany(ReminderLog, {
  foreignKey: 'userId',
  as: 'reminderLogs'
});

ReminderLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

DoseSchedule.hasMany(ReminderLog, {
  foreignKey: 'doseScheduleId',
  as: 'reminderLogs'
});

ReminderLog.belongsTo(DoseSchedule, {
  foreignKey: 'doseScheduleId',
  as: 'doseSchedule'
});

module.exports = {
  User,
  Medication,
  DoseSchedule,
  ReminderLog
};
