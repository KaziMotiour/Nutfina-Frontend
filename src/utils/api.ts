// Shared API utility with automatic token refresh
// API Base URL - configure this in your .env file
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Custom event name for token expiration
export const TOKEN_EXPIRED_EVENT = "token-expired";

// Helper function to get auth token
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    return token ? `Bearer ${token}` : null;
  }
  return null;
};

// Helper function to get refresh token
const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  }
  return null;
};

// Helper function to decode JWT token and check expiration
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    return true; // If we can't decode, consider it expired
  }
};

// Helper function to handle token expiration and logout
const handleTokenExpiration = (reason: string = "Session expired") => {
  // Clear tokens from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    
    // Dispatch custom event for components to listen and handle logout
    window.dispatchEvent(new CustomEvent(TOKEN_EXPIRED_EVENT, { 
      detail: { reason } 
    }));
  }
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Helper function to refresh the access token
export const refreshAccessToken = async (): Promise<string | null> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refresh = getRefreshToken();
      
      if (!refresh) {
        handleTokenExpiration("No refresh token available");
        throw new Error("No refresh token available");
      }

      // Check if refresh token is expired before making the request
      if (isTokenExpired(refresh)) {
        handleTokenExpiration("Refresh token has expired. Please login again.");
        throw new Error("Refresh token has expired");
      }

      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session management
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        // If refresh fails (401, 403, etc.), tokens are expired or invalid
        const error = await response.json().catch(() => ({ detail: "Token refresh failed" }));
        const errorMessage = error.detail || error.message || "Token refresh failed";
        
        // Handle token expiration - clear tokens and notify app
        handleTokenExpiration(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();      
      
      // Store new access token and refresh token (if provided by backend with ROTATE_REFRESH_TOKENS)
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access);
        // Save refresh token if backend returns a new one (when ROTATE_REFRESH_TOKENS is enabled)
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
      }

      return data.access;
    } catch (error: any) {
      // Error handling is done in handleTokenExpiration above
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Helper function for API calls with automatic token refresh
export const apiCall = async (url: string, options: RequestInit = {}, retry = true): Promise<any> => {
    // Check if access token is expired before making request
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (accessToken && isTokenExpired(accessToken)) {
      // Access token is expired, try to refresh it
      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // Use new token for the request
          const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
            ...options.headers,
          };
          
          const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
            credentials: "include",
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "An error occurred" }));
            throw new Error(error.detail || error.message || "Request failed");
          }

          if (response.status === 204) {
            return response;
          }

          return response.json();
        }
      } catch (refreshError: any) {
        // Refresh failed - tokens are expired, user needs to login again
        throw new Error("Session expired. Please login again.");
      }
    }

    const token = getAuthToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // Include cookies for session management (guest cart)
    });

    // If 401 Unauthorized and we haven't retried yet, try to refresh token
    if (response.status === 401 && retry) {        
        try {
            const newAccessToken = await refreshAccessToken();
            
            if (newAccessToken) {
                // Retry the original request with new token
                const newHeaders: HeadersInit = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newAccessToken}`,
                    ...options.headers,
                };
                
                const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
                    ...options,
                    headers: newHeaders,
                    credentials: "include", // Include cookies for session management
                });

                if (!retryResponse.ok) {
                    const error = await retryResponse.json().catch(() => ({ detail: "An error occurred" }));
                    throw new Error(error.detail || error.message || "Request failed");
                }

                if (retryResponse.status === 204) {
                    return retryResponse;
                }

                return retryResponse.json();
            }
        } catch (refreshError: any) {
            // If refresh fails, tokens are expired - user needs to login again
            // handleTokenExpiration is already called in refreshAccessToken
            throw new Error("Session expired. Please login again.");
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "An error occurred" }));
        throw new Error(error.detail || error.message || "Request failed");
    }

    if (response.status === 204) {
        return response;
    }

    return response.json();
};

