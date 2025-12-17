const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medication = sequelize.define('Medication', {
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
  drugName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Medication name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Medication name must be between 2 and 100 characters'
      }
    }
  },
  dosageValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Dosage must be greater than 0'
      }
    }
  },
  dosageUnit: {
    type: DataTypes.ENUM('mg', 'mcg', 'g', 'ml', 'tablet', 'capsule', 'drop', 'spray', 'patch', 'unit'),
    allowNull: false
  },
  frequency: {
    type: DataTypes.ENUM('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed', 'weekly', 'monthly'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
      isAfterStart(value) {
        if (value && this.startDate && new Date(value) < new Date(this.startDate)) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescribedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  refillThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#4A90E2',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  }
}, {
  tableName: 'medications',
  indexes: [
    {
      fields: ['user_id', 'is_active']
    }
  ]
});

module.exports = Medication;
