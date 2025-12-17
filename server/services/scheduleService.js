const { DoseSchedule } = require('../models');
const { 
  addDays, 
  eachDayOfInterval, 
  parseISO, 
  format, 
  setHours,
  setMinutes 
} = require('date-fns');

// Define time slots for different frequencies
const getTimesForFrequency = (frequency) => {
  const timeSlots = {
    once_daily: ['08:00:00'],
    twice_daily: ['08:00:00', '20:00:00'],
    three_times_daily: ['08:00:00', '14:00:00', '20:00:00'],
    four_times_daily: ['08:00:00', '12:00:00', '16:00:00', '20:00:00'],
    every_6_hours: ['06:00:00', '12:00:00', '18:00:00', '00:00:00'],
    every_8_hours: ['08:00:00', '16:00:00', '00:00:00'],
    every_12_hours: ['08:00:00', '20:00:00'],
    as_needed: ['08:00:00'],
    weekly: ['08:00:00'],
    monthly: ['08:00:00']
  };

  return timeSlots[frequency] || ['08:00:00'];
};

// Generate dose schedules for a medication
const generateDoseSchedules = async (medication) => {
  const startDate = parseISO(medication.startDate);
  const endDate = medication.endDate 
    ? parseISO(medication.endDate) 
    : addDays(new Date(), 90); // Default to 90 days from now

  let dates;

  switch (medication.frequency) {
    case 'weekly':
      dates = [];
      let currentDate = startDate;
      while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays(currentDate, 7);
      }
      break;
    
    case 'monthly':
      dates = [];
      let monthDate = startDate;
      while (monthDate <= endDate) {
        dates.push(monthDate);
        monthDate = addDays(monthDate, 30);
      }
      break;
    
    default:
      dates = eachDayOfInterval({ start: startDate, end: endDate });
  }

  const times = getTimesForFrequency(medication.frequency);
  const schedules = [];

  for (const date of dates) {
    for (const time of times) {
      schedules.push({
        medicationId: medication.id,
        scheduledDate: format(date, 'yyyy-MM-dd'),
        scheduledTime: time,
        status: 'pending'
      });
    }
  }

  await DoseSchedule.bulkCreate(schedules);
  return schedules;
};

module.exports = {
  generateDoseSchedules,
  getTimesForFrequency
};
