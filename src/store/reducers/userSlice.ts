import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiCall, API_BASE_URL, getAuthToken, refreshAccessToken } from "@/utils/api";

// Types
export interface User {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    avatar: string | null;
    avatar_url: string | null;
    role: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
    last_login: string | null;
}

export interface Address {
    id: number;
    user: number;
    name: string;
    email: string;
    phone: string;
    full_address: string;
    country: string;
    country_name?: string;
    district: string;
    postal_code: string;
    is_default: boolean;
    created: string;
    last_modified: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    full_name?: string;
    phone?: string;
    password: string;
    password2: string;
}

export interface UserState {
    user: User | null;
    address: Address[];
    defaultAddress: Address | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    address: [],
    defaultAddress: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
    "user/login",
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await apiCall("/auth/login/", {
                method: "POST",
                body: JSON.stringify(credentials),
            });
            console.log("loginUser response", response);
            // Store tokens
            if (typeof window !== "undefined") {
                localStorage.setItem("access_token", response.access);
                localStorage.setItem("refresh_token", response.refresh);
            }

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Login failed");
        }
    }
);

export const registerUser = createAsyncThunk(
    "user/register",
    async (data: RegisterData, { rejectWithValue }) => {
        try {
            const response = await apiCall("/auth/register/", {
              method: "POST",
              body: JSON.stringify(data),
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Registration failed");
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    "user/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiCall("/auth/me/");
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to get user");
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (data: Partial<User> | FormData, { rejectWithValue }) => {
        try {
            const makeRequest = async (authToken: string | null): Promise<any> => {
                const headers: HeadersInit = authToken ? { Authorization: authToken } : {};
                
                // If FormData, don't set Content-Type (browser will set it with boundary)
                if (!(data instanceof FormData)) {
                    headers["Content-Type"] = "application/json";
                }

                const response = await fetch(`${API_BASE_URL}/auth/me/`, {
                    method: "PATCH",
                    headers,
                    body: data instanceof FormData ? data : JSON.stringify(data),
                });

                // If 401, try to refresh token and retry
                if (response.status === 401) {
                    try {
                        const newToken = await refreshAccessToken();
                        if (newToken) {
                            // Retry with new token
                            return makeRequest(`Bearer ${newToken}`);
                        }
                    } catch (refreshError) {
                        // Refresh failed, throw original error
                    }
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
                    throw new Error(error.detail || error.message || "Request failed");
                }

                return response.json();
            };

            const token = getAuthToken();
            return await makeRequest(token);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update user");
        }
    }
);

export const refreshToken = createAsyncThunk(
    "user/refreshToken",
    async (_, { rejectWithValue }) => {
        try {
            const newAccessToken = await refreshAccessToken();
            
            if (!newAccessToken) {
                throw new Error("Token refresh failed");
            }

            return { access: newAccessToken };
        } catch (error: any) {
            return rejectWithValue(error.message || "Token refresh failed");
        }
    }
);

export const getUserAddress = createAsyncThunk(
    "user/getUserAddress",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiCall("/auth/address/");
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to get address");
        }
    }
);

export const createAddress = createAsyncThunk(
    "user/createAddress",
    async (data: Omit<Address, "id" | "user" | "created" | "last_modified" | "country_name">, { rejectWithValue }) => {
        try {
            const response = await apiCall("/auth/address/create/", {
                method: "POST",
                body: JSON.stringify(data),
            });
            return response;
        } catch (error: any) {
            // Handle API error responses
            if (error.response?.data) {
                const errorData = error.response.data;
                // If it's a validation error object, extract the messages
                if (typeof errorData === 'object' && !errorData.message) {
                    const errorMessages = Object.entries(errorData)
                        .map(([key, value]: [string, any]) => {
                            if (Array.isArray(value)) {
                                return `${key}: ${value.join(', ')}`;
                            }
                            return `${key}: ${value}`;
                        })
                        .join('; ');
                    return rejectWithValue(errorMessages || "Validation error");
                }
                return rejectWithValue(errorData.message || errorData.detail || "Failed to create address");
            }
            return rejectWithValue(error.message || "Failed to create address");
        }
    }
);

export const updateAddress = createAsyncThunk(
  "user/updateAddress",
  async ({ id, data }: { id: number; data: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/auth/address/${id}/update/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "user/deleteAddress",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiCall(`/auth/address/${id}/delete/`, {
        method: "DELETE",
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete address");
    }
  }
);

export const getDefaultAddress = createAsyncThunk(
  "user/getDefaultAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiCall("/auth/address/default/", {
        method: "GET",
      });
      
      return response;
    } catch (error: any) {
      // Handle 404 specifically (no default address found)
      if (error.message && error.message.includes("404") || error.message.includes("Not found")) {
        return null;
      }
      return rejectWithValue(error.message || "Failed to get default address");
    }
  }
);

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.address = [];
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // Cart merging will be handled by dispatching mergeCart in the component
        state.loading = false;
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log("getCurrentUser", action.payload);
        
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // If refresh fails, logout user
        state.user = null;
        state.address = [];
        state.defaultAddress = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      });

    // Get Address
    builder
      .addCase(getUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.address = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
      })
      .addCase(getUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Address
    builder
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.address.push(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.address.findIndex((addr) => addr.id === action.payload.id);
        if (index !== -1) {
          state.address[index] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.address = state.address.filter((addr) => addr.id !== action.payload);
        // Clear default address if it was deleted
        if (state.defaultAddress?.id === action.payload) {
          state.defaultAddress = null;
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Default Address
    builder
      .addCase(getDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultAddress = action.payload;
      })
      .addCase(getDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        // Only set error if it's not a 404 (no default address found)
        if (action.payload && !action.payload.toString().includes("404")) {
          state.error = action.payload as string;
        } else {
          state.defaultAddress = null;
        }
      });
  },
});

export const { logout, clearError, setToken } = userSlice.actions;
export default userSlice.reducer;

