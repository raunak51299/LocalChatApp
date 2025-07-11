// Get the correct API base URL based on current host
export const getApiBaseUrl = () => {
  // If we're in development and accessing via localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Otherwise, use the same host but port 3001 (for mobile devices accessing via IP)
  return `http://${window.location.hostname}:3001`;
};

// Get the correct Socket.IO URL
export const getSocketUrl = () => {
  return getApiBaseUrl();
};
