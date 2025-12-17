import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import {
  GET_MEDICATIONS_QUERY,
  DELETE_MEDICATION_MUTATION,
  UPDATE_MEDICATION_MUTATION
} from '../../graphql/queries';
import Navigation from '../../components/Navigation/Navigation';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loading from '../../components/Loading/Loading';
import { formatDate, getFrequencyLabel } from '../../utils/formatters';
import { getFrequencyLabel as getLabel } from '../../utils/constants';
import './Medications.css';

const Medications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('active');
  
  const { data, loading, refetch } = useQuery(GET_MEDICATIONS_QUERY, {
    variables: { isActive: filter === 'active' ? true : filter === 'inactive' ? false : undefined }
  });

  const [deleteMedication] = useMutation(DELETE_MEDICATION_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const [updateMedication] = useMutation(UPDATE_MEDICATION_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const medications = data?.medications || [];

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMedication({ variables: { id } });
      } catch (error) {
        alert('Failed to delete medication: ' + error.message);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await updateMedication({
        variables: { id, isActive: !currentStatus }
      });
    } catch (error) {
      alert('Failed to update medication: ' + error.message);
    }
  };

  return (
    <div className="page">
      <Navigation />
      
      <main className="medications-container">
        <div className="medications-header">
          <div>
            <h1 className="page-title">My Medications</h1>
            <p className="page-subtitle">Manage all your medications in one place</p>
          </div>
          <Link to="/medications/add">
            <Button variant="primary">+ Add Medication</Button>
          </Link>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
            aria-pressed={filter === 'active'}
          >
            Active
          </button>
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
            aria-pressed={filter === 'inactive'}
          >
            Inactive
          </button>
        </div>

        {loading ? (
          <Loading message="Loading medications..." />
        ) : medications.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p className="empty-icon"></p>
              <p className="empty-message">
                {filter === 'active' 
                  ? "You don't have any active medications yet"
                  : filter === 'inactive'
                  ? "No inactive medications"
                  : "You haven't added any medications yet"}
              </p>
              {filter === 'active' && (
                <Link to="/medications/add">
                  <Button variant="primary">Add Your First Medication</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="medications-grid">
            {medications.map(med => (
              <Card key={med.id} className="medication-card">
                <div 
                  className="medication-color-bar" 
                  style={{ backgroundColor: med.color }}
                ></div>
                
                <div className="medication-header">
                  <h3 className="medication-name">{med.drugName}</h3>
                  <span className={`medication-badge ${med.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {med.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="medication-details">
                  <div className="detail-row">
                    <span className="detail-label">Dosage:</span>
                    <span className="detail-value">
                      {med.dosageValue} {med.dosageUnit}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">{getLabel(med.frequency)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(med.startDate)}</span>
                  </div>
                  
                  {med.endDate && (
                    <div className="detail-row">
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">{formatDate(med.endDate)}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="detail-label">Stock:</span>
                    <span className={`detail-value ${med.stockQuantity <= med.refillThreshold ? 'text-warning' : ''}`}>
                      {med.stockQuantity} doses
                      {med.stockQuantity <= med.refillThreshold && ' (Low)'}
                    </span>
                  </div>
                </div>

                {med.instructions && (
                  <div className="medication-instructions">
                    <p className="instructions-label">Instructions:</p>
                    <p className="instructions-text">{med.instructions}</p>
                  </div>
                )}

                <div className="medication-actions">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleToggleActive(med.id, med.isActive)}
                  >
                    {med.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(med.id, med.drugName)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Medications;
