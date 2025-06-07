import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_SUBSCRIPTION } from '../graphql/queries';
import { UPDATE_PAYMENT_METHOD } from '../graphql/mutations';
import './Dashboard.css';
import './BillingPaymentPage.css';

function BillingPaymentPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: true
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Get current subscription (which might include payment method)
  const { loading, error, data } = useQuery(GET_MY_SUBSCRIPTION);
  
  // Update payment method mutation
  const [updatePaymentMethod, { loading: updating }] = useMutation(UPDATE_PAYMENT_METHOD, {
    onCompleted: (data) => {
      if (data?.updatePaymentMethod?.success) {
        alert('Payment method updated successfully!');
        navigate('/billing/usage');
      } else {
        alert(data?.updatePaymentMethod?.message || 'Failed to update payment method');
      }
    },
    onError: (error) => {
      console.error('Error updating payment method:', error);
      alert(`Error updating payment method: ${error.message}`);
    },
    refetchQueries: [
      { query: GET_MY_SUBSCRIPTION }
    ]
  });
  
  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormState({
      ...formState,
      cardNumber: formattedValue
    });
    
    if (formErrors.cardNumber) {
      setFormErrors({
        ...formErrors,
        cardNumber: null
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Validate card number (simple check for length after removing spaces)
    if (formState.cardNumber.replace(/\s+/g, '').length < 13) {
      errors.cardNumber = 'Please enter a valid card number';
    }
    
    // Validate cardholder name
    if (!formState.cardHolderName.trim()) {
      errors.cardHolderName = 'Cardholder name is required';
    }
    
    // Validate expiry month
    if (!formState.expiryMonth) {
      errors.expiryMonth = 'Required';
    }
    
    // Validate expiry year
    if (!formState.expiryYear) {
      errors.expiryYear = 'Required';
    }
    
    // Validate CVV (3-4 digits)
    if (!/^\d{3,4}$/.test(formState.cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Get the last 4 digits
      const lastFour = formState.cardNumber.replace(/\s+/g, '').slice(-4);
      
      // Determine card brand (simplified logic)
      let brand = 'unknown';
      const cardNumber = formState.cardNumber.replace(/\s+/g, '');
      if (cardNumber.startsWith('4')) {
        brand = 'visa';
      } else if (/^5[1-5]/.test(cardNumber)) {
        brand = 'mastercard';
      } else if (/^3[47]/.test(cardNumber)) {
        brand = 'amex';
      } else if (/^6(?:011|5)/.test(cardNumber)) {
        brand = 'discover';
      }
      
      // Submit payment method update
      updatePaymentMethod({
        variables: {
          input: {
            type: 'credit_card',
            token: `tok_${brand}_${Date.now()}`, // Mock token
            lastFour,
            brand,
            expiryMonth: parseInt(formState.expiryMonth),
            expiryYear: parseInt(formState.expiryYear),
            isDefault: true
          }
        }
      });
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="disclaimer-banner">
          <p><strong>DEMO:</strong> API Usage & Billing features shown here are a preview of functionality coming soon to PigeonRTC.</p>
        </div>
        <h1>Payment Methods</h1>
        <p className="subtitle">Update your billing information</p>
      </div>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment information...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p>There was an error loading your payment information. Please try again later.</p>
          <pre>{error.message}</pre>
        </div>
      )}
      
      {data?.mySubscription?.paymentMethod && (
        <div className="current-payment-method">
          <h2>Current Payment Method</h2>
          <div className="payment-card">
            <div className="card-brand">
              <span className={`card-logo ${data.mySubscription.paymentMethod.brand}`}>
                {data.mySubscription.paymentMethod.brand.toUpperCase()}
              </span>
            </div>
            <div className="card-details">
              <p className="card-number">
                •••• •••• •••• {data.mySubscription.paymentMethod.lastFour}
              </p>
              <p className="card-expiry">
                Expires: {data.mySubscription.paymentMethod.expiryMonth}/{data.mySubscription.paymentMethod.expiryYear}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="payment-update-form-container">
        <h2>Update Payment Method</h2>
        <p className="form-description">
          Enter your card details below to update your payment method.
          Your information is securely processed and stored.
        </p>
        
        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formState.cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                className={formErrors.cardNumber ? 'error' : ''}
              />
              {formErrors.cardNumber && <div className="error-message">{formErrors.cardNumber}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="cardHolderName">Cardholder Name</label>
              <input
                type="text"
                id="cardHolderName"
                name="cardHolderName"
                placeholder="John Smith"
                value={formState.cardHolderName}
                onChange={handleChange}
                className={formErrors.cardHolderName ? 'error' : ''}
              />
              {formErrors.cardHolderName && <div className="error-message">{formErrors.cardHolderName}</div>}
            </div>
          </div>
          
          <div className="form-row three-col">
            <div className="form-group">
              <label htmlFor="expiryMonth">Month</label>
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={formState.expiryMonth}
                onChange={handleChange}
                className={formErrors.expiryMonth ? 'error' : ''}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              {formErrors.expiryMonth && <div className="error-message">{formErrors.expiryMonth}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="expiryYear">Year</label>
              <select
                id="expiryYear"
                name="expiryYear"
                value={formState.expiryYear}
                onChange={handleChange}
                className={formErrors.expiryYear ? 'error' : ''}
              >
                <option value="">YYYY</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {formErrors.expiryYear && <div className="error-message">{formErrors.expiryYear}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                placeholder="123"
                maxLength="4"
                value={formState.cvv}
                onChange={handleChange}
                className={formErrors.cvv ? 'error' : ''}
              />
              {formErrors.cvv && <div className="error-message">{formErrors.cvv}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="saveCard"
                name="saveCard"
                checked={formState.saveCard}
                onChange={handleChange}
              />
              <label htmlFor="saveCard">Save card for future payments</label>
            </div>
          </div>
          
          <div className="secure-payment-notice">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <p>Your payment info is secured with SSL encryption</p>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn primary"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Payment Method'}
            </button>
            <Link to="/billing/usage" className="btn secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillingPaymentPage;
