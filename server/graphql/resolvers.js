const { requireAuth, generateToken } = require('../middleware/auth');
const { User, Medication, DoseSchedule, ReminderLog } = require('../models');
const { Op } = require('sequelize');
const { 
  addDays, 
  eachDayOfInterval, 
  parseISO, 
  format, 
  startOfDay,
  differenceInDays
} = require('date-fns');
const { generateDoseSchedules } = require('../services/scheduleService');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      const user = requireAuth(context);
      return user;
    },

    medications: async (_, { isActive }, context) => {
      const user = requireAuth(context);
      const where = { userId: user.id };
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      return await Medication.findAll({
        where,
        include: [{
          model: DoseSchedule,
          as: 'schedules',
          required: false
        }],
        order: [['createdAt', 'DESC']]
      });
    },

    medication: async (_, { id }, context) => {
      const user = requireAuth(context);
      const medication = await Medication.findOne({
        where: { id, userId: user.id },
        include: [{
          model: DoseSchedule,
          as: 'schedules',
          required: false
        }]
      });

      if (!medication) {
        throw new Error('Medication not found');
      }

      return medication;
    },

    doseSchedules: async (_, { startDate, endDate }, context) => {
      const user = requireAuth(context);
      
      const schedules = await DoseSchedule.findAll({
        where: {
          scheduledDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id },
          required: true
        }],
        order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']]
      });

      return schedules;
    },

    doseSchedulesForToday: async (_, __, context) => {
      const user = requireAuth(context);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const schedules = await DoseSchedule.findAll({
        where: {
          scheduledDate: today
        },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id, isActive: true },
          required: true
        }],
        order: [['scheduledTime', 'ASC']]
      });

      return schedules;
    },

    adherenceStats: async (_, { startDate, endDate }, context) => {
      const user = requireAuth(context);
      
      const schedules = await DoseSchedule.findAll({
        where: {
          scheduledDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id },
          required: true
        }]
      });

      const totalDoses = schedules.length;
      const takenDoses = schedules.filter(s => s.status === 'taken').length;
      const missedDoses = schedules.filter(s => s.status === 'missed').length;
      const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

      // Calculate streaks
      const sortedSchedules = schedules.sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      for (const schedule of sortedSchedules) {
        if (schedule.status === 'taken') {
          if (!lastDate || differenceInDays(new Date(schedule.scheduledDate), lastDate) === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
          lastDate = new Date(schedule.scheduledDate);
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Current streak is only valid if it includes today or yesterday
      const today = startOfDay(new Date());
      if (lastDate && differenceInDays(today, lastDate) <= 1) {
        currentStreak = tempStreak;
      }

      return {
        totalDoses,
        takenDoses,
        missedDoses,
        adherenceRate: Math.round(adherenceRate * 100) / 100,
        currentStreak,
        longestStreak
      };
    },

    dailyAdherence: async (_, { startDate, endDate }, context) => {
      const user = requireAuth(context);
      
      const schedules = await DoseSchedule.findAll({
        where: {
          scheduledDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id },
          required: true
        }]
      });

      const dailyStats = {};
      const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate)
      });

      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        dailyStats[dateStr] = {
          date: dateStr,
          totalDoses: 0,
          takenDoses: 0,
          missedDoses: 0,
          adherenceRate: 0
        };
      });

      schedules.forEach(schedule => {
        const dateStr = schedule.scheduledDate;
        if (dailyStats[dateStr]) {
          dailyStats[dateStr].totalDoses++;
          if (schedule.status === 'taken') {
            dailyStats[dateStr].takenDoses++;
          } else if (schedule.status === 'missed') {
            dailyStats[dateStr].missedDoses++;
          }
        }
      });

      return Object.values(dailyStats).map(day => ({
        ...day,
        adherenceRate: day.totalDoses > 0 
          ? Math.round((day.takenDoses / day.totalDoses) * 100 * 100) / 100
          : 0
      }));
    },

    reminderLogs: async (_, { limit = 50 }, context) => {
      const user = requireAuth(context);
      
      return await ReminderLog.findAll({
        where: { userId: user.id },
        limit,
        order: [['createdAt', 'DESC']]
      });
    }
  },

  Mutation: {
    signup: async (_, { email, password, firstName, lastName, phoneNumber }) => {
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      });

      const token = generateToken(user.id);

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user.id);

      return { token, user };
    },

    addMedication: async (_, args, context) => {
      const user = requireAuth(context);

      const medication = await Medication.create({
        ...args,
        userId: user.id
      });

      // Generate dose schedules
      await generateDoseSchedules(medication);

      return await Medication.findByPk(medication.id, {
        include: [{
          model: DoseSchedule,
          as: 'schedules'
        }]
      });
    },

    updateMedication: async (_, { id, ...updates }, context) => {
      const user = requireAuth(context);

      const medication = await Medication.findOne({
        where: { id, userId: user.id }
      });

      if (!medication) {
        throw new Error('Medication not found');
      }

      await medication.update(updates);

      // If frequency or dates changed, regenerate schedules
      if (updates.frequency || updates.startDate || updates.endDate) {
        await DoseSchedule.destroy({
          where: {
            medicationId: id,
            status: 'pending',
            scheduledDate: {
              [Op.gte]: format(new Date(), 'yyyy-MM-dd')
            }
          }
        });
        
        await generateDoseSchedules(medication);
      }

      return await Medication.findByPk(id, {
        include: [{
          model: DoseSchedule,
          as: 'schedules'
        }]
      });
    },

    deleteMedication: async (_, { id }, context) => {
      const user = requireAuth(context);

      const medication = await Medication.findOne({
        where: { id, userId: user.id }
      });

      if (!medication) {
        throw new Error('Medication not found');
      }

      await medication.destroy();
      return true;
    },

    markDoseAsTaken: async (_, { id, notes }, context) => {
      const user = requireAuth(context);

      const doseSchedule = await DoseSchedule.findOne({
        where: { id },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id },
          required: true
        }]
      });

      if (!doseSchedule) {
        throw new Error('Dose schedule not found');
      }

      await doseSchedule.markAsTaken(notes);

      // Decrement stock quantity
      if (doseSchedule.medication.stockQuantity > 0) {
        await doseSchedule.medication.update({
          stockQuantity: doseSchedule.medication.stockQuantity - 1
        });
      }

      return doseSchedule;
    },

    markDoseAsMissed: async (_, { id, notes }, context) => {
      const user = requireAuth(context);

      const doseSchedule = await DoseSchedule.findOne({
        where: { id },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id },
          required: true
        }]
      });

      if (!doseSchedule) {
        throw new Error('Dose schedule not found');
      }

      await doseSchedule.markAsMissed(notes);
      return doseSchedule;
    },

    markDoseAsSkipped: async (_, { id, notes }, context) => {
      const user = requireAuth(context);

      const doseSchedule = await DoseSchedule.findOne({
        where: { id },
        include: [{
          model: Medication,
          as: 'medication',
          where: { userId: user.id },
          required: true
        }]
      });

      if (!doseSchedule) {
        throw new Error('Dose schedule not found');
      }

      doseSchedule.status = 'skipped';
      if (notes) doseSchedule.notes = notes;
      await doseSchedule.save();

      return doseSchedule;
    }
  }
};

module.exports = resolvers;
