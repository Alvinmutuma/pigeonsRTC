import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_INVOICES } from '../graphql/queries';
import { GENERATE_INVOICE } from '../graphql/mutations';
import './Dashboard.css';
import './BillingInvoicesPage.css';

function BillingInvoicesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  
  // Fetch invoices
  const { loading, error, data, refetch } = useQuery(GET_MY_INVOICES, {
    variables: { page, limit },
    fetchPolicy: 'network-only' // Don't use cache for invoices
  });
  
  // Generate invoice mutation
  const [generateInvoice, { loading: generatingInvoice }] = useMutation(GENERATE_INVOICE, {
    onCompleted: () => {
      alert('Invoice generated successfully!');
      refetch(); // Refresh invoice list
    },
    onError: (error) => {
      console.error('Error generating invoice:', error);
      alert(`Error generating invoice: ${error.message}`);
    }
  });
  
  // Handle pagination
  const handleNextPage = () => {
    if (data?.myInvoices?.hasNextPage) {
      setPage(page + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  // Handle invoice generation
  const handleGenerateInvoice = () => {
    generateInvoice({
      variables: {
        month: selectedMonth,
        year: selectedYear
      }
    });
  };
  
  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status badge class
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  };
  
  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="disclaimer-banner">
          <p><strong>DEMO:</strong> API Usage & Billing features shown here are a preview of functionality coming soon to PigeonRTC.</p>
        </div>
        <h1>Invoices & Billing History</h1>
        <p className="subtitle">View and download your past invoices</p>
      </div>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading invoices...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p>There was an error loading your invoices. Please try again later.</p>
          <pre>{error.message}</pre>
        </div>
      )}
      
      <div className="invoices-tools">
        <div className="generate-invoice-form">
          <h3>Generate Invoice</h3>
          <div className="form-inputs">
            <div className="form-group">
              <label htmlFor="invoiceMonth">Month:</label>
              <select 
                id="invoiceMonth" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="invoiceYear">Year:</label>
              <select 
                id="invoiceYear" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="generate-btn" 
              onClick={handleGenerateInvoice}
              disabled={generatingInvoice}
            >
              {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </div>
      </div>
      
      {data?.myInvoices?.invoices.length > 0 ? (
        <div className="invoices-list-container">
          <div className="invoices-list">
            <div className="invoice-list-header">
              <div className="invoice-col invoice-number">Invoice #</div>
              <div className="invoice-col date">Date</div>
              <div className="invoice-col amount">Amount</div>
              <div className="invoice-col status">Status</div>
              <div className="invoice-col actions">Actions</div>
            </div>
            
            {data.myInvoices.invoices.map(invoice => (
              <div key={invoice.id} className="invoice-row">
                <div className="invoice-col invoice-number">{invoice.invoiceNumber}</div>
                <div className="invoice-col date">{formatDate(invoice.createdAt)}</div>
                <div className="invoice-col amount">
                  {invoice.currency === 'USD' ? '$' : ''}
                  {invoice.amount.toFixed(2)} {invoice.currency !== 'USD' ? invoice.currency : ''}
                </div>
                <div className="invoice-col status">
                  <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="invoice-col actions">
                  {invoice.pdf && (
                    <a 
                      href={invoice.pdf} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-download"
                    >
                      Download PDF
                    </a>
                  )}
                  <button className="btn-view">View Details</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="page-info">Page {page}</span>
            <button 
              className="pagination-btn" 
              onClick={handleNextPage}
              disabled={!data?.myInvoices?.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="no-invoices">
          <h3>No Invoices Found</h3>
          <p>You don't have any invoices yet. Generate one using the form above.</p>
        </div>
      )}
      
      <div className="billing-actions-footer">
        <Link to="/billing/usage" className="btn secondary">Back to Billing</Link>
      </div>
    </div>
  );
}

export default BillingInvoicesPage;
