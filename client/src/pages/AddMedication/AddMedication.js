import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ADD_MEDICATION_MUTATION, GET_MEDICATIONS_QUERY } from '../../graphql/queries';
import Navigation from '../../components/Navigation/Navigation';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import { DOSAGE_UNITS, FREQUENCIES, MEDICATION_COLORS } from '../../utils/constants';
import './AddMedication.css';

const AddMedication = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    drugName: '',
    dosageValue: '',
    dosageUnit: 'mg',
    frequency: 'once_daily',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    instructions: '',
    prescribedBy: '',
    stockQuantity: '',
    refillThreshold: '7',
    color: MEDICATION_COLORS[0]
  });
  const [errors, setErrors] = useState({});

  const [addMedication, { loading }] = useMutation(ADD_MEDICATION_MUTATION, {
    onCompleted: () => {
      navigate('/medications');
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
    refetchQueries: [{ query: GET_MEDICATIONS_QUERY, variables: { isActive: true } }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.drugName.trim()) {
        newErrors.drugName = 'Medication name is required';
      }
      if (!formData.dosageValue || formData.dosageValue <= 0) {
        newErrors.dosageValue = 'Please enter a valid dosage';
      }
    }

    if (currentStep === 2) {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (formData.endDate && formData.endDate < formData.startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateStep(step)) return;

    try {
      await addMedication({
        variables: {
          drugName: formData.drugName,
          dosageValue: parseFloat(formData.dosageValue),
          dosageUnit: formData.dosageUnit,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          instructions: formData.instructions || null,
          prescribedBy: formData.prescribedBy || null,
          stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0,
          refillThreshold: parseInt(formData.refillThreshold),
          color: formData.color
        }
      });
    } catch (err) {
      // Error handling is done in onError callback
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h2 className="step-title">Basic Information</h2>
      <p className="step-description">Let's start with the essentials</p>

      <Input
        label="Medication Name"
        type="text"
        name="drugName"
        value={formData.drugName}
        onChange={handleChange}
        error={errors.drugName}
        placeholder="e.g., Lisinopril"
        required
        autoFocus
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <Input
          label="Dosage Amount"
          type="number"
          name="dosageValue"
          value={formData.dosageValue}
          onChange={handleChange}
          error={errors.dosageValue}
          placeholder="10"
          min="0"
          step="0.01"
          required
        />

        <Select
          label="Unit"
          name="dosageUnit"
          value={formData.dosageUnit}
          onChange={handleChange}
          options={DOSAGE_UNITS}
          required
        />
      </div>

      <Select
        label="How often do you take this?"
        name="frequency"
        value={formData.frequency}
        onChange={handleChange}
        options={FREQUENCIES}
        required
      />

      <div className="form-actions">
        <Button type="button" onClick={() => navigate('/medications')} variant="outline">
          Cancel
        </Button>
        <Button type="button" onClick={handleNext} variant="primary">
          Next Step →
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2 className="step-title">Schedule & Duration</h2>
      <p className="step-description">When should you take this medication?</p>

      <Input
        label="Start Date"
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        error={errors.startDate}
        required
      />

      <Input
        label="End Date (optional)"
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        error={errors.endDate}
        min={formData.startDate}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input
          label="Current Stock"
          type="number"
          name="stockQuantity"
          value={formData.stockQuantity}
          onChange={handleChange}
          placeholder="30"
          min="0"
        />

        <Input
          label="Refill Alert (doses)"
          type="number"
          name="refillThreshold"
          value={formData.refillThreshold}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div className="form-actions">
        <Button type="button" onClick={handleBack} variant="outline">
          ← Back
        </Button>
        <Button type="button" onClick={handleNext} variant="primary">
          Next Step →
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2 className="step-title">Additional Details</h2>
      <p className="step-description">Add any extra information (optional)</p>

      <Input
        label="Prescribed By (optional)"
        type="text"
        name="prescribedBy"
        value={formData.prescribedBy}
        onChange={handleChange}
        placeholder="Dr. Smith"
      />

      <div className="input-group">
        <label htmlFor="instructions" className="input-label">
          Special Instructions (optional)
        </label>
        <textarea
          id="instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          placeholder="Take with food, avoid alcohol, etc."
          className="input textarea"
          rows="4"
        />
      </div>

      <div className="input-group">
        <label className="input-label">Choose a Color</label>
        <div className="color-picker">
          {MEDICATION_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`color-option ${formData.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {errors.general && (
        <div className="alert alert-error" role="alert">
          {errors.general}
        </div>
      )}

      <div className="form-actions">
        <Button type="button" onClick={handleBack} variant="outline">
          ← Back
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Medication'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Navigation />
      
      <main className="add-medication-container">
        <div className="progress-indicator">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`progress-step ${s <= step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
            >
              <div className="progress-circle">{s < step ? '✓' : s}</div>
              <span className="progress-label">
                {s === 1 ? 'Basic Info' : s === 2 ? 'Schedule' : 'Details'}
              </span>
            </div>
          ))}
        </div>

        <Card className="add-medication-card">
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AddMedication;
