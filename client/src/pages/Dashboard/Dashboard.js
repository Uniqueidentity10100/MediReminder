import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import {
  GET_ME_QUERY,
  GET_TODAY_DOSES_QUERY,
  GET_ADHERENCE_STATS_QUERY
} from '../../graphql/queries';
import Navigation from '../../components/Navigation/Navigation';
import Card from '../../components/Card/Card';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import './Dashboard.css';

const Dashboard = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const { data: userData } = useQuery(GET_ME_QUERY);
  const { data: todayData, loading: todayLoading } = useQuery(GET_TODAY_DOSES_QUERY);
  const { data: statsData, loading: statsLoading } = useQuery(GET_ADHERENCE_STATS_QUERY, {
    variables: { startDate: thirtyDaysAgo, endDate: today }
  });

  const user = userData?.me;
  const todayDoses = todayData?.doseSchedulesForToday || [];
  const stats = statsData?.adherenceStats;

  const takenToday = todayDoses.filter(d => d.status === 'taken').length;
  const totalToday = todayDoses.length;
  const todayProgress = totalToday > 0 ? (takenToday / totalToday) * 100 : 0;

  const lowStockMeds = todayDoses
    .filter(d => d.medication.stockQuantity <= 7)
    .map(d => d.medication)
    .filter((med, index, self) => 
      index === self.findIndex(m => m.id === med.id)
    );

  return (
    <div className="page">
      <Navigation />
      
      <main className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">
              Welcome back, {user?.firstName || 'there'}
            </h1>
            <p className="page-subtitle">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Link to="/medications/add">
            <Button variant="primary">+ Add Medication</Button>
          </Link>
        </div>

        {/* Today's Overview */}
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}></div>
            <div className="stat-content">
              <h3 className="stat-label">Today's Doses</h3>
              <p className="stat-value">{takenToday} / {totalToday}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${todayProgress}%` }}
                  role="progressbar"
                  aria-valuenow={todayProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </Card>

          {!statsLoading && stats && (
            <>
              <Card className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}></div>
                <div className="stat-content">
                  <h3 className="stat-label">30-Day Adherence</h3>
                  <p className="stat-value">{stats.adherenceRate.toFixed(1)}%</p>
                  <p className="stat-detail">
                    {stats.takenDoses} of {stats.totalDoses} doses taken
                  </p>
                </div>
              </Card>

              <Card className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#FFF3E0' }}></div>
                <div className="stat-content">
                  <h3 className="stat-label">Current Streak</h3>
                  <p className="stat-value">{stats.currentStreak} days</p>
                  <p className="stat-detail">
                    Best: {stats.longestStreak} days
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Low Stock Alerts */}
        {lowStockMeds.length > 0 && (
          <Card className="alert-card">
            <h3 className="alert-title">Low Stock Alerts</h3>
            <div className="alert-list">
              {lowStockMeds.map(med => (
                <div key={med.id} className="alert-item">
                  <span className="alert-med-name">{med.drugName}</span>
                  <span className="alert-stock">
                    {med.stockQuantity} doses remaining
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Today's Schedule */}
        <div className="schedule-section">
          <h2 className="section-title">Today's Schedule</h2>
          
          {todayLoading ? (
            <Loading message="Loading today's doses..." />
          ) : todayDoses.length === 0 ? (
            <Card>
              <div className="empty-state">
                <p className="empty-icon"></p>
                <p className="empty-message">No doses scheduled for today</p>
              </div>
            </Card>
          ) : (
            <div className="dose-list">
              {todayDoses.map(dose => (
                <Link 
                  key={dose.id} 
                  to="/calendar" 
                  className="dose-item-link"
                >
                  <Card className="dose-item">
                    <div 
                      className="dose-color" 
                      style={{ backgroundColor: dose.medication.color }}
                    ></div>
                    <div className="dose-info">
                      <h4 className="dose-name">{dose.medication.drugName}</h4>
                      <p className="dose-details">
                        {dose.medication.dosageValue} {dose.medication.dosageUnit}
                      </p>
                    </div>
                    <div className="dose-time">
                      {format(new Date(`2000-01-01T${dose.scheduledTime}`), 'h:mm a')}
                    </div>
                    <div className={`dose-status status-${dose.status}`}>
                      {dose.status === 'taken' ? '✓' : 
                       dose.status === 'missed' ? 'X' : 'O'}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <Link to="/medications">
            <Button variant="outline" fullWidth>
              View All Medications
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
