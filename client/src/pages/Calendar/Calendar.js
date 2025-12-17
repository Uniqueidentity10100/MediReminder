import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import {
  GET_DOSE_SCHEDULES_QUERY,
  MARK_DOSE_TAKEN_MUTATION,
  MARK_DOSE_MISSED_MUTATION,
  MARK_DOSE_SKIPPED_MUTATION
} from '../../graphql/queries';
import Navigation from '../../components/Navigation/Navigation';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loading from '../../components/Loading/Loading';
import './Calendar.css';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });

  const { data, loading, refetch } = useQuery(GET_DOSE_SCHEDULES_QUERY, {
    variables: {
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd')
    }
  });

  const [markTaken] = useMutation(MARK_DOSE_TAKEN_MUTATION, {
    onCompleted: () => refetch()
  });

  const [markMissed] = useMutation(MARK_DOSE_MISSED_MUTATION, {
    onCompleted: () => refetch()
  });

  const [markSkipped] = useMutation(MARK_DOSE_SKIPPED_MUTATION, {
    onCompleted: () => refetch()
  });

  const schedules = data?.doseSchedules || [];

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSchedulesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(s => s.scheduledDate === dateStr);
  };

  const selectedDaySchedules = getSchedulesForDate(selectedDate);

  const handleMarkTaken = async (id) => {
    try {
      await markTaken({ variables: { id } });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleMarkMissed = async (id) => {
    try {
      await markMissed({ variables: { id } });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleMarkSkipped = async (id) => {
    try {
      await markSkipped({ variables: { id } });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const navigateWeek = (direction) => {
    setSelectedDate(addDays(selectedDate, direction * 7));
  };

  return (
    <div className="page">
      <Navigation />
      
      <main className="calendar-container">
        <div className="calendar-header">
          <h1 className="page-title">Medication Calendar</h1>
          <p className="page-subtitle">Track your daily medication schedule</p>
        </div>

        <Card className="week-navigator">
          <div className="week-controls">
            <Button onClick={() => navigateWeek(-1)} variant="outline" size="small">
              ← Previous Week
            </Button>
            <Button onClick={() => setSelectedDate(new Date())} variant="outline" size="small">
              Today
            </Button>
            <Button onClick={() => navigateWeek(1)} variant="outline" size="small">
              Next Week →
            </Button>
          </div>

          <div className="week-calendar">
            {weekDays.map(day => {
              const daySchedules = getSchedulesForDate(day);
              const takenCount = daySchedules.filter(s => s.status === 'taken').length;
              const totalCount = daySchedules.length;
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDate(day)}
                  aria-label={`${format(day, 'EEEE, MMMM d')}, ${takenCount} of ${totalCount} doses taken`}
                  aria-pressed={isSelected}
                >
                  <span className="day-label">{format(day, 'EEE')}</span>
                  <span className="day-number">{format(day, 'd')}</span>
                  {totalCount > 0 && (
                    <div className="day-progress">
                      <div 
                        className="day-progress-fill"
                        style={{ width: `${(takenCount / totalCount) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="selected-date-header">
          <h2 className="selected-date-title">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          {selectedDaySchedules.length > 0 && (
            <span className="dose-count">
              {selectedDaySchedules.filter(s => s.status === 'taken').length} of{' '}
              {selectedDaySchedules.length} doses taken
            </span>
          )}
        </div>

        {loading ? (
          <Loading message="Loading schedule..." />
        ) : selectedDaySchedules.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p className="empty-icon">✅</p>
              <p className="empty-message">No medications scheduled for this day</p>
            </div>
          </Card>
        ) : (
          <div className="schedule-list">
            {selectedDaySchedules.map(dose => (
              <Card key={dose.id} className="dose-card">
                <div className="dose-card-header">
                  <div 
                    className="dose-color-indicator" 
                    style={{ backgroundColor: dose.medication.color }}
                  ></div>
                  <div className="dose-info-section">
                    <h3 className="dose-med-name">{dose.medication.drugName}</h3>
                    <p className="dose-med-dosage">
                      {dose.medication.dosageValue} {dose.medication.dosageUnit}
                    </p>
                  </div>
                  <div className="dose-time-section">
                    <span className="dose-time">
                      {format(parseISO(`2000-01-01T${dose.scheduledTime}`), 'h:mm a')}
                    </span>
                  </div>
                </div>

                <div className="dose-status-section">
                  <div className={`status-indicator status-${dose.status}`}>
                    <span className="status-icon">
                      {dose.status === 'taken' ? '✓' : 
                       dose.status === 'missed' ? '✗' : 
                       dose.status === 'skipped' ? '⊘' : '○'}
                    </span>
                    <span className="status-text">
                      {dose.status === 'taken' ? 'Taken' : 
                       dose.status === 'missed' ? 'Missed' : 
                       dose.status === 'skipped' ? 'Skipped' : 'Pending'}
                    </span>
                  </div>

                  {dose.takenAt && (
                    <p className="taken-at-text">
                      Taken at {format(parseISO(dose.takenAt), 'h:mm a')}
                    </p>
                  )}

                  {dose.notes && (
                    <p className="dose-notes">Note: {dose.notes}</p>
                  )}
                </div>

                {dose.status === 'pending' && (
                  <div className="dose-actions">
                    <Button
                      onClick={() => handleMarkTaken(dose.id)}
                      variant="secondary"
                      size="small"
                    >
                      ✓ Mark Taken
                    </Button>
                    <Button
                      onClick={() => handleMarkSkipped(dose.id)}
                      variant="outline"
                      size="small"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={() => handleMarkMissed(dose.id)}
                      variant="danger"
                      size="small"
                    >
                      Missed
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Calendar;
