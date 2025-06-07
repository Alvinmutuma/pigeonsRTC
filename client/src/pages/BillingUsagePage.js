// client/src/pages/BillingUsagePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { GET_MY_USAGE, GET_MY_SUBSCRIPTION } from '../graphql/queries';
import './Dashboard.css'; // Reuse dashboard styling
import './BillingUsagePage.css'; // Create this file for billing specific styles

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function BillingUsagePage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch usage data
  const { loading: usageLoading, error: usageError, data: usageData } = useQuery(GET_MY_USAGE, {
    variables: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    },
    fetchPolicy: 'network-only' // Don't use cache for usage data
  });

  // Fetch subscription details
  const { loading: subLoading, error: subError, data: subData } = useQuery(GET_MY_SUBSCRIPTION);

  // Handler for date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Prepare chart data when usage data is loaded
  const [dailyUsageChartData, setDailyUsageChartData] = useState(null);
  const [agentUsageChartData, setAgentUsageChartData] = useState(null);

  useEffect(() => {
    if (usageData?.myUsage) {
      // Prepare daily usage chart data
      const dailyData = {
        labels: usageData.myUsage.usageByDay.map(item => item.date),
        datasets: [
          {
            label: 'Daily API Calls',
            data: usageData.myUsage.usageByDay.map(item => item.count),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
      setDailyUsageChartData(dailyData);

      // Prepare agent usage chart data
      const agentData = {
        labels: usageData.myUsage.usageByAgent.map(item => item.agent.name),
        datasets: [
          {
            label: 'API Calls by Agent',
            data: usageData.myUsage.usageByAgent.map(item => item.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
      setAgentUsageChartData(agentData);
    }
  }, [usageData]);

  // Calculate usage percentage
  const usagePercentage = subData?.mySubscription ? 
    Math.round((subData.mySubscription.currentUsage / subData.mySubscription.monthlyQuota) * 100) : 0;

  return (
    <div className="dashboard-container">
      <div className="billing-page-container">
        <div className="disclaimer-banner">
          <p><strong>DEMO:</strong> API Usage & Billing features shown here are a preview of functionality coming soon to PigeonRTC.</p>
        </div>
        <h1>API Usage & Billing</h1>
        <p className="subtitle">Track your API consumption and manage your billing details.</p>
      </div>
      
      {(usageLoading || subLoading) && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your data...</p>
        </div>
      )}

      {(usageError || subError) && (
        <div className="error-container">
          <p>There was an error loading your data. Please try again later.</p>
          <pre>{usageError?.message || subError?.message}</pre>
        </div>
      )}

      {subData?.mySubscription && (
        <div className="billing-card subscription-summary">
          <h2>Subscription Summary</h2>
          <div className="subscription-details">
            <div className="plan-info">
              <h3>{subData.mySubscription.planName} Plan</h3>
              <p className="plan-status">
                Status: <span className={`status-${subData.mySubscription.status}`}>{subData.mySubscription.status}</span>
              </p>
              {subData.mySubscription.trialEndsAt && (
                <p className="trial-info">
                  Trial ends: {new Date(subData.mySubscription.trialEndsAt).toLocaleDateString()}
                </p>
              )}
              <p className="renewal-info">
                Auto-renew: <span>{subData.mySubscription.autoRenew ? 'Yes' : 'No'}</span>
              </p>
            </div>
            
            <div className="usage-meter">
              <h3>Monthly Usage</h3>
              <div className="progress-container">
                <div 
                  className={`progress-bar ${usagePercentage > 90 ? 'danger' : usagePercentage > 75 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              <p className="usage-stats">
                {subData.mySubscription.currentUsage.toLocaleString()} / {subData.mySubscription.monthlyQuota.toLocaleString()} API calls
                <span className="usage-percentage">({usagePercentage}%)</span>
              </p>
            </div>
            
            <div className="action-buttons">
              <Link to="/billing/plan" className="btn primary">Change Plan</Link>
              <Link to="/billing/payment" className="btn secondary">Payment Methods</Link>
            </div>
          </div>
        </div>
      )}

      <div className="usage-analytics">
        <div className="date-filter">
          <h2>Usage Analytics</h2>
          <div className="date-range-controls">
            <div className="form-group">
              <label htmlFor="startDate">From:</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                value={dateRange.startDate} 
                onChange={handleDateChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">To:</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                value={dateRange.endDate} 
                onChange={handleDateChange} 
                min={dateRange.startDate}
              />
            </div>
          </div>
        </div>

        {usageData?.myUsage && (
          <>
            <div className="total-usage-summary">
              <div className="usage-stat-card">
                <h3>Total API Calls</h3>
                <p className="stat-value">{usageData.myUsage.total.toLocaleString()}</p>
                <p className="stat-period">{dateRange.startDate} to {dateRange.endDate}</p>
              </div>
              
              <div className="usage-stat-card">
                <h3>Daily Average</h3>
                <p className="stat-value">
                  {Math.round(usageData.myUsage.total / usageData.myUsage.usageByDay.length).toLocaleString()}
                </p>
                <p className="stat-period">calls per day</p>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-card">
                <h3>Daily Usage</h3>
                {dailyUsageChartData && (
                  <Line 
                    data={dailyUsageChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }} 
                  />
                )}
              </div>
              
              <div className="chart-card">
                <h3>Usage by Agent</h3>
                {agentUsageChartData && (
                  <Bar 
                    data={agentUsageChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }} 
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="billing-actions-footer">
        <Link to="/billing/invoices" className="btn primary">View Invoices</Link>
        <Link to="/business-dashboard" className="btn secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
}

export default BillingUsagePage;
