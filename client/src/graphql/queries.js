import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $phoneNumber: String
  ) {
    signup(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
    ) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      phoneNumber
      role
      timezone
      notificationPreferences {
        email
        sms
        push
      }
    }
  }
`;

export const GET_MEDICATIONS_QUERY = gql`
  query GetMedications($isActive: Boolean) {
    medications(isActive: $isActive) {
      id
      drugName
      dosageValue
      dosageUnit
      frequency
      startDate
      endDate
      instructions
      prescribedBy
      stockQuantity
      refillThreshold
      isActive
      color
      createdAt
    }
  }
`;

export const GET_MEDICATION_QUERY = gql`
  query GetMedication($id: ID!) {
    medication(id: $id) {
      id
      drugName
      dosageValue
      dosageUnit
      frequency
      startDate
      endDate
      instructions
      prescribedBy
      stockQuantity
      refillThreshold
      isActive
      color
      schedules {
        id
        scheduledDate
        scheduledTime
        status
        takenAt
        notes
      }
    }
  }
`;

export const ADD_MEDICATION_MUTATION = gql`
  mutation AddMedication(
    $drugName: String!
    $dosageValue: Float!
    $dosageUnit: DosageUnit!
    $frequency: Frequency!
    $startDate: Date!
    $endDate: Date
    $instructions: String
    $prescribedBy: String
    $stockQuantity: Int
    $refillThreshold: Int
    $color: String
  ) {
    addMedication(
      drugName: $drugName
      dosageValue: $dosageValue
      dosageUnit: $dosageUnit
      frequency: $frequency
      startDate: $startDate
      endDate: $endDate
      instructions: $instructions
      prescribedBy: $prescribedBy
      stockQuantity: $stockQuantity
      refillThreshold: $refillThreshold
      color: $color
    ) {
      id
      drugName
      dosageValue
      dosageUnit
      frequency
      startDate
      endDate
      color
    }
  }
`;

export const UPDATE_MEDICATION_MUTATION = gql`
  mutation UpdateMedication(
    $id: ID!
    $drugName: String
    $dosageValue: Float
    $dosageUnit: DosageUnit
    $frequency: Frequency
    $startDate: Date
    $endDate: Date
    $instructions: String
    $prescribedBy: String
    $stockQuantity: Int
    $refillThreshold: Int
    $isActive: Boolean
    $color: String
  ) {
    updateMedication(
      id: $id
      drugName: $drugName
      dosageValue: $dosageValue
      dosageUnit: $dosageUnit
      frequency: $frequency
      startDate: $startDate
      endDate: $endDate
      instructions: $instructions
      prescribedBy: $prescribedBy
      stockQuantity: $stockQuantity
      refillThreshold: $refillThreshold
      isActive: $isActive
      color: $color
    ) {
      id
      drugName
      isActive
    }
  }
`;

export const DELETE_MEDICATION_MUTATION = gql`
  mutation DeleteMedication($id: ID!) {
    deleteMedication(id: $id)
  }
`;

export const GET_DOSE_SCHEDULES_QUERY = gql`
  query GetDoseSchedules($startDate: Date!, $endDate: Date!) {
    doseSchedules(startDate: $startDate, endDate: $endDate) {
      id
      scheduledDate
      scheduledTime
      status
      takenAt
      notes
      medication {
        id
        drugName
        dosageValue
        dosageUnit
        color
      }
    }
  }
`;

export const GET_TODAY_DOSES_QUERY = gql`
  query GetTodayDoses {
    doseSchedulesForToday {
      id
      scheduledDate
      scheduledTime
      status
      takenAt
      notes
      medication {
        id
        drugName
        dosageValue
        dosageUnit
        color
        stockQuantity
      }
    }
  }
`;

export const MARK_DOSE_TAKEN_MUTATION = gql`
  mutation MarkDoseAsTaken($id: ID!, $notes: String) {
    markDoseAsTaken(id: $id, notes: $notes) {
      id
      status
      takenAt
      notes
    }
  }
`;

export const MARK_DOSE_MISSED_MUTATION = gql`
  mutation MarkDoseAsMissed($id: ID!, $notes: String) {
    markDoseAsMissed(id: $id, notes: $notes) {
      id
      status
      notes
    }
  }
`;

export const MARK_DOSE_SKIPPED_MUTATION = gql`
  mutation MarkDoseAsSkipped($id: ID!, $notes: String) {
    markDoseAsSkipped(id: $id, notes: $notes) {
      id
      status
      notes
    }
  }
`;

export const GET_ADHERENCE_STATS_QUERY = gql`
  query GetAdherenceStats($startDate: Date!, $endDate: Date!) {
    adherenceStats(startDate: $startDate, endDate: $endDate) {
      totalDoses
      takenDoses
      missedDoses
      adherenceRate
      currentStreak
      longestStreak
    }
  }
`;

export const GET_DAILY_ADHERENCE_QUERY = gql`
  query GetDailyAdherence($startDate: Date!, $endDate: Date!) {
    dailyAdherence(startDate: $startDate, endDate: $endDate) {
      date
      totalDoses
      takenDoses
      missedDoses
      adherenceRate
    }
  }
`;
