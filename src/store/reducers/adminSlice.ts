import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall } from "@/utils/api";

// Types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders?: any[];
  topProducts?: any[];
}

export interface AdminState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  orders: {
    results: any[];
    count: number;
    next: string | null;
    previous: string | null;
    loading: boolean;
    error: string | null;
    filters: {
      status: string;
      payment_status: string;
      ordering: string;
      search: string;
      page: number;
      page_size: number;
    };
  };
}

const initialState: AdminState = {
  stats: null,
  loading: false,
  error: null,
  orders: {
    results: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
    filters: {
      status: "",
      payment_status: "",
      ordering: "-created",
      search: "",
      page: 1,
      page_size: 20,
    },
  },
};

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all data in parallel
      const [productsResponse, ordersResponse] = await Promise.all([
        apiCall("/shop/products/", { method: "GET" }).catch(() => ({ results: [], count: 0 })),
        apiCall("/orders/orders/", { method: "GET" }).catch(() => ({ results: [], count: 0 })),
      ]);

      // Handle products response (could be paginated or array)
      let products: any[] = [];
      let totalProducts = 0;
      if (Array.isArray(productsResponse)) {
        products = productsResponse;
        totalProducts = productsResponse.length;
      } else if (productsResponse.results) {
        products = productsResponse.results;
        totalProducts = productsResponse.count || products.length;
      }

      // Handle orders response (could be paginated or array)
      let orders: any[] = [];
      let totalOrders = 0;
      if (Array.isArray(ordersResponse)) {
        orders = ordersResponse;
        totalOrders = ordersResponse.length;
      } else if (ordersResponse.results) {
        orders = ordersResponse.results;
        totalOrders = ordersResponse.count || orders.length;
      }

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + parseFloat(order.total_amount || order.subtotal || "0");
      }, 0);

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.created || b.created_at).getTime() - new Date(a.created || a.created_at).getTime())
        .slice(0, 5);

      // Try to get users count (if endpoint exists)
      let totalUsers = 0;
      try {
        // Note: You may need to create a users list endpoint in the backend
        // For now, we'll try to get it or default to 0
        const usersResponse = await apiCall("/auth/users/", { method: "GET" }).catch(() => null);
        if (usersResponse) {
          totalUsers = usersResponse.count || (Array.isArray(usersResponse) ? usersResponse.length : 0);
        }
      } catch (error) {
        // Users endpoint might not exist, that's okay
        console.log("Users endpoint not available");
      }

      // Get top products (products with most orders or highest sales)
      // This is a simplified version - you might want to enhance this
      const topProducts = products.slice(0, 5);

      return {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
        topProducts,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch dashboard stats");
    }
  }
);

// Fetch Orders with filters and pagination
export const fetchOrders = createAsyncThunk(
  "admin/fetchOrders",
  async (params: {
    status?: string;
    payment_status?: string;
    ordering?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append("status", params.status);
      if (params.payment_status) queryParams.append("payment_status", params.payment_status);
      if (params.ordering) queryParams.append("ordering", params.ordering);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.page_size) queryParams.append("page_size", params.page_size.toString());
      // Search by order_number - supports partial matching (icontains)
      if (params.search) {
        queryParams.append("order_number", params.search);
      }

      // Ensure trailing slash is preserved even with query params
      const baseUrl = "/orders/orders/";
      const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
      const response = await apiCall(url, { method: "GET" });

      // Handle both paginated and non-paginated responses
      if (Array.isArray(response)) {
        return {
          results: response,
          count: response.length,
          next: null,
          previous: null,
        };
      }

      return {
        results: response.results || [],
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch orders");
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ orderId, status }: { orderId: number; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/orders/orders/${orderId}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update order status");
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.orders.error = null;
    },
    resetStats: (state) => {
      state.stats = null;
    },
    setOrderFilters: (state, action) => {
      state.orders.filters = {
        ...state.orders.filters,
        ...action.payload,
      };
    },
    resetOrderFilters: (state) => {
      state.orders.filters = {
        status: "",
        payment_status: "",
        ordering: "-created",
        search: "",
        page: 1,
        page_size: 20,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.results = action.payload.results;
        state.orders.count = action.payload.count;
        state.orders.next = action.payload.next;
        state.orders.previous = action.payload.previous;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload as string;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        // Update the order in the results array
        const index = state.orders.results.findIndex((order: any) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders.results[index] = action.payload;
        }
      });
  },
});

export const { clearError, resetStats, setOrderFilters, resetOrderFilters } = adminSlice.actions;
export default adminSlice.reducer;
