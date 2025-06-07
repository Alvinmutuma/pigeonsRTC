// server/utils/urlChecker.js
const axios = require('axios');

/**
 * Performs an HTTP HEAD request to the given URL to check its reachability and status.
 * @param {string} url The URL to check.
 * @returns {Promise<object>} An object containing the status, httpStatusCode, and details.
 */
const performUrlCheck = async (url) => {
  if (!url) {
    return {
      status: 'NOT_APPLICABLE',
      httpStatusCode: null,
      details: 'URL not provided.',
    };
  }

  try {
    // Use HEAD request to be lightweight, only fetching headers
    const response = await axios.head(url, { timeout: 10000 }); // 10-second timeout

    if (response.status >= 200 && response.status < 400) {
      return {
        status: 'SUCCESS',
        httpStatusCode: response.status,
        details: `Successfully reached URL. Status: ${response.status}`,
      };
    } else {
      return {
        status: 'FAILURE',
        httpStatusCode: response.status,
        details: `URL responded with status: ${response.status}`,
      };
    }
  } catch (error) {
    let details = 'Failed to reach URL.';
    let httpStatusCode = null;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        details = `Server responded with error: ${error.response.status} - ${error.response.statusText}`;
        httpStatusCode = error.response.status;
      } else if (error.request) {
        // The request was made but no response was received
        details = 'No response received from URL. It might be down or unreachable.';
      } else {
        // Something happened in setting up the request that triggered an Error
        details = `Error setting up request: ${error.message}`;
      }
    } else {
      details = `An unexpected error occurred: ${error.message}`;
    }
    
    return {
      status: 'ERROR',
      httpStatusCode: httpStatusCode,
      details: details,
    };
  }
};

module.exports = { performUrlCheck };
