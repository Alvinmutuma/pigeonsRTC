import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Basic page number generation (can be made more sophisticated)
  const pageNumbers = [];
  const maxPagesToShow = 5; // Max number of page links to show
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    // Less than or equal to maxPagesToShow, so show all pages
    startPage = 1;
    endPage = totalPages;
  } else {
    // More than maxPagesToShow, so calculate start and end pages
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // Near the start
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // Near the end
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      // Somewhere in the middle
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-controls" aria-label="Page navigation">
      <button 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
        className="pagination-button prev-next"
      >
        &laquo; Previous
      </button>
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="pagination-button">1</button>
          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}
      {pageNumbers.map(number => (
        <button 
          key={number} 
          onClick={() => onPageChange(number)} 
          className={`pagination-button ${currentPage === number ? 'active-page' : ''}`}
        >
          {number}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="pagination-button">{totalPages}</button>
        </>
      )}
      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
        className="pagination-button prev-next"
      >
        Next &raquo;
      </button>
    </nav>
  );
};

export default Pagination;
