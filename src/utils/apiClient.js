// src/utils/apiClient.js

// Get base URL. Use environment variable for deployed version.
// The REACT_APP_ prefix is required by Create React App.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const getToken = () => sessionStorage.getItem('pwa-auth-token'); // Or import from context if preferred

const apiClient = async (endpoint, method = 'GET', body = null) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    // Add body for relevant methods
    if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
    }

    try {
        const fullUrl = `${API_BASE_URL}${endpoint}`;
        console.log(`API Request: ${method} ${fullUrl}`); // Log the full URL being requested

        const response = await fetch(fullUrl, config); // <-- Use fullUrl here

        // Handle No Content response (e.g., for DELETE)
        if (response.status === 204) {
            console.log(`API Response: ${method} ${endpoint} -> 204 No Content`);
             return null; // Or return an empty object/success indicator
        }

        const data = await response.json(); // Attempt to parse JSON

         console.log(`API Response: ${method} ${endpoint} -> ${response.status}`); // Log response status

        if (!response.ok) {
            // Log detailed error from API if available
             console.error(`API Error ${response.status}:`, data.error || data.message || 'Unknown API error');
            // Throw an error object that includes the status and API message
            const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.data = data; // Attach full response data if needed
            throw error;
        }

        return data; // Return successful data

    } catch (error) {
         console.error('API Client Error:', error);
        // Re-throw the error so calling components can handle it
        // Or handle specific errors like network errors here
         if (!error.status) { // Likely a network error or JSON parse error
             error.message = `Network error or invalid response: ${error.message}`;
         }
         throw error;
    }
};

export default apiClient;