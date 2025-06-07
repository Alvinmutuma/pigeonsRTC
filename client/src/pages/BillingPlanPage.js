import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AVAILABLE_PLANS, GET_MY_SUBSCRIPTION } from '../graphql/queries';
import { UPDATE_SUBSCRIPTION } from '../graphql/mutations';
import './Dashboard.css';
import './BillingPlanPage.css';

function BillingPlanPage() {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  
  // Fetch available plans
  const { loading: plansLoading, error: plansError, data: plansData } = useQuery(GET_AVAILABLE_PLANS);
  
  // Fetch current subscription
  const { loading: subLoading, error: subError, data: subData } = useQuery(GET_MY_SUBSCRIPTION);
  
  // Update subscription mutation
  const [updateSubscription, { loading: updateLoading }] = useMutation(UPDATE_SUBSCRIPTION, {
    onCompleted: () => {
      setConfirmationOpen(false);
      // Show success message
      alert('Your subscription has been updated successfully!');
      navigate('/billing/usage');
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      alert(`Error updating subscription: ${error.message}`);
    },
    refetchQueries: [
      { query: GET_MY_SUBSCRIPTION }
    ]
  });
  
  // When a plan is selected
  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    setConfirmationOpen(true);
  };
  
  // Handle plan change confirmation
  const handleConfirmPlanChange = () => {
    updateSubscription({
      variables: {
        input: {
          planId: selectedPlanId,
          autoRenew: true // Default to auto-renew enabled
        }
      }
    });
  };
  
  // Determine if a plan is the current one
  const isCurrentPlan = (planId) => {
    if (!subData?.mySubscription) return false;
    return subData.mySubscription.planId === planId;
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="disclaimer-banner">
          <p><strong>DEMO:</strong> API Usage & Billing features shown here are a preview of functionality coming soon to PigeonRTC.</p>
        </div>
        <h1>Subscription Plans</h1>
        <p className="subtitle">Choose the right plan for your needs</p>
      </div>
      
      {(plansLoading || subLoading) && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading plans...</p>
        </div>
      )}
      
      {(plansError || subError) && (
        <div className="error-container">
          <p>There was an error loading the subscription plans. Please try again later.</p>
          <pre>{plansError?.message || subError?.message}</pre>
        </div>
      )}
      
      {subData?.mySubscription && (
        <div className="current-plan-summary">
          <h2>Your Current Plan</h2>
          <div className="current-plan-details">
            <h3>{subData.mySubscription.planName}</h3>
            <p className="plan-status">
              Status: <span className={`status-${subData.mySubscription.status}`}>{subData.mySubscription.status}</span>
            </p>
            <p className="quota-info">
              Monthly Quota: {subData.mySubscription.monthlyQuota.toLocaleString()} API calls
            </p>
            {subData.mySubscription.trialEndsAt && (
              <p className="trial-info">
                Trial ends: {new Date(subData.mySubscription.trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="plans-container">
        {plansData?.availablePlans && plansData.availablePlans.map(plan => (
          <div 
            key={plan.id} 
            className={`plan-card ${isCurrentPlan(plan.id) ? 'current-plan' : ''} ${plan.isPopular ? 'popular-plan' : ''}`}
          >
            {plan.isPopular && <div className="popular-badge">Most Popular</div>}
            
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
            
            <div className="plan-price">
              <span className="price-amount">${plan.price}</span>
              <span className="price-period">/{plan.interval}</span>
            </div>
            
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            <div className="plan-limits">
              <div className="limit-item">
                <span className="limit-label">API Calls:</span>
                <span className="limit-value">{plan.limits.apiCalls.toLocaleString()}</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">Agents:</span>
                <span className="limit-value">{plan.limits.agents}</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">Team Members:</span>
                <span className="limit-value">{plan.limits.teamMembers}</span>
              </div>
            </div>
            
            <button 
              className={`plan-select-btn ${isCurrentPlan(plan.id) ? 'current' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
              disabled={isCurrentPlan(plan.id) || updateLoading}
            >
              {isCurrentPlan(plan.id) ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
      
      {confirmationOpen && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirm Plan Change</h3>
            <p>
              Are you sure you want to change your subscription plan? 
              Your new plan will be effective immediately.
            </p>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setConfirmationOpen(false)}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleConfirmPlanChange}
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="billing-actions-footer">
        <Link to="/billing/usage" className="btn secondary">Back to Billing</Link>
      </div>
    </div>
  );
}

export default BillingPlanPage;
