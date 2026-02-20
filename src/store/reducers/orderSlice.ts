import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiCall, clearCartToken } from "@/utils/api";
import { logout } from "./userSlice";

// Types
export interface CartItem {
  id: number;
  cart: string;
  variant: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  variant_detail?: any;
}

export interface Cart {
  id: string;
  cart_token?: string;
  user: number | null;
  status: "active" | "ordered" | "abandoned";
  subtotal: string;
  item_count: number;
  items: CartItem[];
  created: string;
  last_modified: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: number | null;
  product_name: string;
  variant: number | null;
  variant_detail?: any;
  product_detail?: any;
  quantity: number;
  unit_price: string;
  total_price: string;
  created: string;
  
}

export interface ShippingAddress {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  full_address: string;
  country: string;
  country_name: string;
  district: string;
  postal_code: string;
  is_default: boolean;
}

export interface Order {
  id: number;
  order_number: string;
  user: number | null;
  user_email: string | null;
  shipping_address: number | null;
  shipping_address_detail?: ShippingAddress | null;
  coupon?: number | null;
  coupon_code?: string;
  coupon_detail?: Coupon | null;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "completed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  subtotal: string;
  discount: string;
  shipping_fee: string;
  total_amount: string;
  items: OrderItem[];
  payment?: Payment;
  placed_at: string;
  shipped_at: string | null;
  status_changed_at: string | null;
  notes: string;
  created: string;
  last_modified: string;
}

export interface Payment {
  id: number;
  order: number;
  amount: string;
  method: string;
  transaction_id: string | null;
  status: "initiated" | "success" | "failed" | "refunded";
  raw_response: Record<string, any>;
  created: string;
  last_modified: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_percent: string | null;
  discount_amount: string | null;
  valid_from: string;
  valid_to: string;
  active: boolean;
  max_uses: number | null;
  per_user_limit: number | null;
  is_valid?: boolean;
  created: string;
  last_modified: string;
}

export interface OrderState {
  cart: Cart | null;
  orders: Order[];
  currentOrder: Order | null;
  payments: Payment[];
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  cart: null,
  orders: [],
  currentOrder: null,
  payments: [],
  coupons: [],
  loading: false,
  error: null,
};

// Async Thunks - Cart
export const getCart = createAsyncThunk(
  "order/getCart",
  async (_, { rejectWithValue }) => {
    try {
      // Works for both authenticated and guest users (token-based guest cart)
      const response = await apiCall("/orders/cart/", {
        method: "GET",
      });
      return response;
    } catch (error: any) {
      // If 404, return empty cart structure
      if (error.message && error.message.includes("404")) {
        return null;
      }
      return rejectWithValue(error.message || "Failed to get cart");
    }
  },
  {
    // Prevent duplicate pending requests - return false to cancel dispatch if already loading
    condition: (_, { getState }) => {
      const state = getState() as { order: OrderState };
      // Cancel dispatch if already loading (prevents duplicate simultaneous requests)
      if (state.order.loading) {
        return false; // Cancel this dispatch
      }
      return true; // Allow dispatch
    },
  }
);

export const addToCart = createAsyncThunk(
  "order/addToCart",
  async (data: { variant_id: number; quantity: number }, { rejectWithValue }) => {
    try {
      // Works for both authenticated and guest users (token-based guest cart)
      const response = await apiCall("/orders/cart/add/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response; // Returns full cart
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add to cart");
    }
  }
);

export const mergeCart = createAsyncThunk(
  "order/mergeCart",
  async (_, { rejectWithValue }) => {
    try {
      // For token-based cart flow this keeps current behavior by refreshing cart state.
      const response = await apiCall("/orders/cart/", {
        method: "GET",
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to merge cart");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "order/updateCartItem",
  async ({ id, quantity }: { id: number; quantity: number }, { rejectWithValue }) => {
    try {
      // Backend returns full cart after update
      const response = await apiCall(`/orders/cart/items/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      return response; // Returns full cart
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update cart item");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "order/removeFromCart",
  async (id: number, { rejectWithValue }) => {
    try {
      // Backend returns full cart after removal
      const response = await apiCall(`/orders/cart/items/${id}/remove/`, {
        method: "DELETE",
      });
      return response; // Returns full cart
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove from cart");
    }
  }
);

// Async Thunks - Orders
export const getOrders = createAsyncThunk(
  "order/getOrders",
  async (params: { status?: string; payment_status?: string; page?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.payment_status) queryParams.append("payment_status", params.payment_status);
      if (params?.page) queryParams.append("page", String(params.page));

      const queryString = queryParams.toString();
      const baseUrl = "/orders/orders/";
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const response = await apiCall(url);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get orders");
    }
  }
);

export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (idOrOrderNumber: number | string, { rejectWithValue }) => {
    try {
      // Check if it's a number (ID) or string (order_number)
      const isNumber = typeof idOrOrderNumber === 'number' || !isNaN(Number(idOrOrderNumber));
      let url;
      
      if (isNumber) {
        // Use ID endpoint
        url = `/orders/orders/${idOrOrderNumber}/`;
      } else {
        // Use order_number endpoint
        url = `/orders/orders/by-number/${idOrOrderNumber}/`;
      }
      
      const response = await apiCall(url);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get order");
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (data: {
    items: Array<{ variant_id: number; quantity: number; unit_price?: string }>;
    shipping_address_id?: number;
    payment_method?: string;
    coupon_code?: string;
    shipping_fee?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiCall("/orders/checkout/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      clearCartToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create order");
    }
  }
);

// New checkout thunk that matches the backend API contract
export const checkout = createAsyncThunk(
  "order/checkout",
  async (data: {
    address_id?: number;
    address?: {
      name: string;
      email?: string;
      phone: string;
      full_address: string;
      country: string;
      district: string;
      postal_code?: string;
      is_default?: boolean;
    };
    coupon_code?: string;
    payment_method?: string;
    shipping_fee?: number;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiCall("/orders/checkout/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      clearCartToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to checkout");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ id, status }: { id: number; status: Order["status"] }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/orders/orders/${id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update order status");
    }
  }
);

// Async Thunks - Payments
export const getPayment = createAsyncThunk(
  "order/getPayment",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/orders/payments/${id}/`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get payment");
    }
  }
);

export const createPayment = createAsyncThunk(
  "order/createPayment",
  async (data: {
    order_id: number;
    method: string;
    transaction_id?: string;
    raw_response?: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const response = await apiCall("/orders/payments/create/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create payment");
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "order/updatePaymentStatus",
  async ({ id, status }: { id: number; status: Payment["status"] }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/orders/payments/${id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update payment status");
    }
  }
);

// Async Thunks - Coupons
export const getCoupons = createAsyncThunk(
  "order/getCoupons",
  async (params: { active?: boolean }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.active !== undefined) queryParams.append("active", String(params.active));
      
      const url = `/orders/coupons/${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await apiCall(url);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get coupons");
    }
  }
);

export const validateCoupon = createAsyncThunk(
  "order/validateCoupon",
  async (data: { code: string; subtotal?: string }, { rejectWithValue }) => {
    try {
      const response = await apiCall("/orders/coupons/validate/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to validate coupon");
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.cart = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    // Optimistic update for cart item quantity
    optimisticUpdateCartItem: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      if (state.cart && state.cart.items) {
        const item = state.cart.items.find((item) => item.id === action.payload.id);
        if (item) {
          const oldQuantity = item.quantity;
          const unitPrice = parseFloat(item.unit_price);
          
          item.quantity = action.payload.quantity;
          item.line_total = (unitPrice * action.payload.quantity).toFixed(2);
          
          // Update cart totals
          const newSubtotal = state.cart.items.reduce((sum, item) => {
            return sum + parseFloat(item.line_total);
          }, 0);
          state.cart.subtotal = newSubtotal.toFixed(2);
          state.cart.item_count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          
          // Store old quantity for potential rollback
          (item as any)._oldQuantity = oldQuantity;
        }
      }
    },
    // Rollback optimistic update if backend request fails
    rollbackCartItemUpdate: (state, action: PayloadAction<{ id: number }>) => {
      if (state.cart && state.cart.items) {
        const item = state.cart.items.find((item) => item.id === action.payload.id);
        if (item && (item as any)._oldQuantity !== undefined) {
          const oldQuantity = (item as any)._oldQuantity;
          const unitPrice = parseFloat(item.unit_price);
          
          item.quantity = oldQuantity;
          item.line_total = (unitPrice * oldQuantity).toFixed(2);
          
          // Recalculate cart totals
          const newSubtotal = state.cart.items.reduce((sum, item) => {
            return sum + parseFloat(item.line_total);
          }, 0);
          state.cart.subtotal = newSubtotal.toFixed(2);
          state.cart.item_count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          
          // Remove rollback data
          delete (item as any)._oldQuantity;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Clear cart state on logout so guest cart can be fetched fresh again
    builder.addCase(logout, (state) => {
      state.cart = null;
      state.loading = false;
      state.error = null;
    });

    // Cart
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns full cart
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        // Explicitly ignore backend response - keep frontend-calculated values
        // The optimistic update already updated the cart with frontend calculations
        // We do NOT update state.cart here - this is intentionally a no-op
        // The action.payload contains the backend response, but we completely ignore it
        // to maintain the frontend-calculated values from optimisticUpdateCartItem
        // 
        // This ensures that when a user changes quantity:
        // 1. Frontend calculates and updates immediately (optimisticUpdateCartItem)
        // 2. Backend request is sent for persistence
        // 3. Backend response is received but ignored (this case)
        // 4. Frontend-calculated values remain in the cart
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        // Backend returns full cart after removal
        state.cart = action.payload;
      });

    // Orders
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        // Clear cart after successful order
        state.cart = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        // Clear cart after successful checkout
        state.cart = null;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      });

    // Payments
    builder
      .addCase(getPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        } else {
          state.payments.push(action.payload);
        }
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload);
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      });

    // Coupons
    builder
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        // Coupon validation response
        if (action.payload.valid) {
          // You can store validated coupon info if needed
        }
      });
  },
});

export const { clearError, clearCart, setCurrentOrder, optimisticUpdateCartItem, rollbackCartItemUpdate } = orderSlice.actions;
export default orderSlice.reducer;

