// Shared API utility with automatic token refresh
// API Base URL - configure this in your .env file
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
        throw new Error("No refresh token available");
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
        const error = await response.json().catch(() => ({ detail: "Token refresh failed" }));
        throw new Error(error.detail || error.message || "Token refresh failed");
      }

      const data = await response.json();
      
      // Store new access token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access);
      }

      return data.access;
    } catch (error: any) {
      // If refresh fails, clear tokens and logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
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

                return retryResponse.json();
            }
        } catch (refreshError: any) {
            // If refresh fails, throw the original 401 error
            const error = await response.json().catch(() => ({ detail: "Unauthorized" }));
            throw new Error(error.detail || error.message || "Unauthorized");
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "An error occurred" }));
        throw new Error(error.detail || error.message || "Request failed");
    }

    return response.json();
};

