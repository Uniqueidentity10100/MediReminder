const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar Time

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    role: UserRole!
    timezone: String!
    notificationPreferences: NotificationPreferences!
    medications: [Medication!]!
    createdAt: Date!
  }

  type NotificationPreferences {
    email: Boolean!
    sms: Boolean!
    push: Boolean!
  }

  enum UserRole {
    patient
    caregiver
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Medication {
    id: ID!
    userId: ID!
    drugName: String!
    dosageValue: Float!
    dosageUnit: DosageUnit!
    frequency: Frequency!
    startDate: Date!
    endDate: Date
    instructions: String
    prescribedBy: String
    stockQuantity: Int!
    refillThreshold: Int!
    isActive: Boolean!
    color: String!
    schedules: [DoseSchedule!]!
    user: User!
    createdAt: Date!
    updatedAt: Date!
  }

  enum DosageUnit {
    mg
    mcg
    g
    ml
    tablet
    capsule
    drop
    spray
    patch
    unit
  }

  enum Frequency {
    once_daily
    twice_daily
    three_times_daily
    four_times_daily
    every_6_hours
    every_8_hours
    every_12_hours
    as_needed
    weekly
    monthly
  }

  type DoseSchedule {
    id: ID!
    medicationId: ID!
    scheduledDate: Date!
    scheduledTime: Time!
    status: DoseStatus!
    takenAt: Date
    notes: String
    medication: Medication!
    createdAt: Date!
    updatedAt: Date!
  }

  enum DoseStatus {
    pending
    taken
    missed
    skipped
  }

  type ReminderLog {
    id: ID!
    userId: ID!
    doseScheduleId: ID
    reminderType: ReminderType!
    deliveryMethod: DeliveryMethod!
    status: ReminderStatus!
    message: String!
    sentAt: Date
    errorMessage: String
    createdAt: Date!
  }

  enum ReminderType {
    dose
    refill
    appointment
  }

  enum DeliveryMethod {
    email
    sms
    push
  }

  enum ReminderStatus {
    pending
    sent
    failed
    cancelled
  }

  type AdherenceStats {
    totalDoses: Int!
    takenDoses: Int!
    missedDoses: Int!
    adherenceRate: Float!
    currentStreak: Int!
    longestStreak: Int!
  }

  type DailyAdherence {
    date: Date!
    totalDoses: Int!
    takenDoses: Int!
    missedDoses: Int!
    adherenceRate: Float!
  }

  type Query {
    # User queries
    me: User

    # Medication queries
    medications(isActive: Boolean): [Medication!]!
    medication(id: ID!): Medication

    # Dose schedule queries
    doseSchedules(startDate: Date!, endDate: Date!): [DoseSchedule!]!
    doseSchedulesForToday: [DoseSchedule!]!
    
    # Analytics queries
    adherenceStats(startDate: Date!, endDate: Date!): AdherenceStats!
    dailyAdherence(startDate: Date!, endDate: Date!): [DailyAdherence!]!

    # Reminder queries
    reminderLogs(limit: Int): [ReminderLog!]!
  }

  type Mutation {
    # Authentication mutations
    signup(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
      phoneNumber: String
    ): AuthPayload!
    
    login(email: String!, password: String!): AuthPayload!

    # Medication mutations
    addMedication(
      drugName: String!
      dosageValue: Float!
      dosageUnit: DosageUnit!
      frequency: Frequency!
      startDate: Date!
      endDate: Date
      instructions: String
      prescribedBy: String
      stockQuantity: Int
      refillThreshold: Int
      color: String
    ): Medication!

    updateMedication(
      id: ID!
      drugName: String
      dosageValue: Float
      dosageUnit: DosageUnit
      frequency: Frequency
      startDate: Date
      endDate: Date
      instructions: String
      prescribedBy: String
      stockQuantity: Int
      refillThreshold: Int
      isActive: Boolean
      color: String
    ): Medication!

    deleteMedication(id: ID!): Boolean!

    # Dose schedule mutations
    markDoseAsTaken(id: ID!, notes: String): DoseSchedule!
    markDoseAsMissed(id: ID!, notes: String): DoseSchedule!
    markDoseAsSkipped(id: ID!, notes: String): DoseSchedule!
  }
`;

module.exports = typeDefs;
