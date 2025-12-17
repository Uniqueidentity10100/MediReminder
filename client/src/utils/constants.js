export const DOSAGE_UNITS = [
  { value: 'mg', label: 'mg (milligrams)' },
  { value: 'mcg', label: 'mcg (micrograms)' },
  { value: 'g', label: 'g (grams)' },
  { value: 'ml', label: 'ml (milliliters)' },
  { value: 'tablet', label: 'Tablet(s)' },
  { value: 'capsule', label: 'Capsule(s)' },
  { value: 'drop', label: 'Drop(s)' },
  { value: 'spray', label: 'Spray(s)' },
  { value: 'patch', label: 'Patch(es)' },
  { value: 'unit', label: 'Unit(s)' }
];

export const FREQUENCIES = [
  { value: 'once_daily', label: 'Once daily', description: 'Take once per day' },
  { value: 'twice_daily', label: 'Twice daily', description: 'Take twice per day' },
  { value: 'three_times_daily', label: 'Three times daily', description: 'Take three times per day' },
  { value: 'four_times_daily', label: 'Four times daily', description: 'Take four times per day' },
  { value: 'every_6_hours', label: 'Every 6 hours', description: 'Take every 6 hours' },
  { value: 'every_8_hours', label: 'Every 8 hours', description: 'Take every 8 hours' },
  { value: 'every_12_hours', label: 'Every 12 hours', description: 'Take every 12 hours' },
  { value: 'as_needed', label: 'As needed', description: 'Take when needed' },
  { value: 'weekly', label: 'Weekly', description: 'Take once per week' },
  { value: 'monthly', label: 'Monthly', description: 'Take once per month' }
];

export const MEDICATION_COLORS = [
  '#4A90E2', // Blue
  '#50C878', // Green
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#F39C12', // Orange
  '#3498DB', // Light Blue
  '#1ABC9C', // Teal
  '#E91E63', // Pink
];

export const getFrequencyLabel = (frequency) => {
  const freq = FREQUENCIES.find(f => f.value === frequency);
  return freq ? freq.label : frequency;
};

export const getDosageUnitLabel = (unit) => {
  const dosageUnit = DOSAGE_UNITS.find(u => u.value === unit);
  return dosageUnit ? dosageUnit.label : unit;
};
