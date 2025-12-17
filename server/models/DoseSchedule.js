const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DoseSchedule = sequelize.define('DoseSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  medicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medications',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'taken', 'missed', 'skipped'),
    defaultValue: 'pending',
    allowNull: false
  },
  takenAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'dose_schedules',
  indexes: [
    {
      fields: ['medication_id', 'scheduled_date']
    },
    {
      fields: ['status']
    }
  ]
});

// Method to mark dose as taken
DoseSchedule.prototype.markAsTaken = async function(notes = null) {
  this.status = 'taken';
  this.takenAt = new Date();
  if (notes) this.notes = notes;
  await this.save();
  return this;
};

// Method to mark dose as missed
DoseSchedule.prototype.markAsMissed = async function(notes = null) {
  this.status = 'missed';
  if (notes) this.notes = notes;
  await this.save();
  return this;
};

module.exports = DoseSchedule;
