import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiCall, getAuthToken, API_BASE_URL, refreshAccessToken } from "@/utils/api";

// Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created: string;
  last_modified: string;
}

export interface ProductImage {
  id: number;
  product: number;
  image: string;
  image_url?: string;
  is_active: boolean;
  alt_text: string;
  ordering: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: number | Category;
  category_name: string;
  description: string;
  base_price: string;
  is_active: boolean;
  is_featured: boolean;
  created: string;
  last_modified: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product: number | Product;
  sku: string;
  name: string;
  price: string;
  cost_price: string | null;
  weight_grams: number | null;
  barcode: string | null;
  on_sale: boolean;
  discount_type: "amount" | "percent";
  discount_value: string | null;
  available_from: string | null;
  available_to: string | null;
  attributes: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
  final_price: string;
  created: string;
  last_modified: string;
  images?: ProductVariantImage[];
  product_images?: ProductImage[];
}

export interface ProductVariantImage {
  id: number;
  variant: number;
  image: string;
  image_url?: string;
  is_active: boolean;
  ordering: number;
}

export interface Inventory {
  id: number;
  variant: number;
  quantity: number;
  low_stock_threshold: number;
  available?: number;
  reserved?: number;
}

export interface ShopState {
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
  productVariants: ProductVariant[];
  inventory: Inventory[];
  currentProduct: Product | null;
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

const initialState: ShopState = {
  categories: [],
  products: [],
  featuredProducts: [],
  productVariants: [],
  inventory: [],
  currentProduct: null,
  currentCategory: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Async Thunks - Categories
export const getCategories = createAsyncThunk(
  "shop/getCategories",
  async (params: { is_active?: boolean; search?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
      if (params?.search) queryParams.append("search", params.search);
      
      const url = `/shop/categories/${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await apiCall(url);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get categories");
    }
  }
);

export const getCategory = createAsyncThunk(
  "shop/getCategory",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/shop/categories/${slug}/`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get category");
    }
  }
);

export const createCategory = createAsyncThunk(
  "shop/createCategory",
  async (data: Omit<Category, "id" | "created_at" | "updated_at">, { rejectWithValue }) => {
    try {
      const response = await apiCall("/shop/categories/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "shop/updateCategory",
  async ({ slug, data }: { slug: string; data: Partial<Category> }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/shop/categories/${slug}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "shop/deleteCategory",
  async (slug: string, { rejectWithValue }) => {
    try {
      await apiCall(`/shop/categories/${slug}/`, {
        method: "DELETE",
      });
      return slug;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete category");
    }
  }
);

// Async Thunks - Products
export const getProducts = createAsyncThunk(
  "shop/getProducts",
  async (params: {
    category?: string;
    is_active?: boolean;
    is_featured?: boolean;
    search?: string;
    page?: number;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append("category", String(params.category));
      if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
      if (params?.is_featured !== undefined) queryParams.append("is_featured", String(params.is_featured));
      if (params?.search) queryParams.append("search", params.search);
      if (params?.page) queryParams.append("page", String(params.page));
      const url = `/shop/products/${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await apiCall(url);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get products");
    }
  }
);

export const getProduct = createAsyncThunk(
  "shop/getProduct",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/shop/products/${slug}/`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get product");
    }
  }
);

export const getFeaturedProducts = createAsyncThunk(
  "shop/getFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiCall("/shop/products/featured/");
      return Array.isArray(response) ? response : response.results || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get featured products");
    }
  }
);

export const createProduct = createAsyncThunk(
  "shop/createProduct",
  async (data: FormData | Omit<Product, "id" | "created_at" | "updated_at">, { rejectWithValue }) => {
    try {
      const makeRequest = async (authToken: string | null): Promise<any> => {
        const headers: HeadersInit = authToken ? { Authorization: authToken } : {};
        
        // If FormData, don't set Content-Type (browser will set it with boundary)
        if (!(data instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(`${API_BASE_URL}/shop/products/`, {
          method: "POST",
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
      return rejectWithValue(error.message || "Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "shop/updateProduct",
  async ({ slug, data }: { slug: string; data: FormData | Partial<Product> }, { rejectWithValue }) => {
    try {
      const makeRequest = async (authToken: string | null): Promise<any> => {
        const headers: HeadersInit = authToken ? { Authorization: authToken } : {};
        
        if (!(data instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(`${API_BASE_URL}/shop/products/${slug}/`, {
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
      return rejectWithValue(error.message || "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "shop/deleteProduct",
  async (slug: string, { rejectWithValue }) => {
    try {
      await apiCall(`/shop/products/${slug}/`, {
        method: "DELETE",
      });
      return slug;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete product");
    }
  }
);

// Async Thunks - Product Variants
export const getProductVariants = createAsyncThunk(
  "shop/getProductVariants",
  async (params: {
    product?: number;
    is_active?: boolean;
    is_featured?: boolean;
    on_sale?: boolean;
    search?: string;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.product) queryParams.append("product", String(params.product));
      if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
      if (params?.is_featured !== undefined) queryParams.append("is_featured", String(params.is_featured));
      if (params?.on_sale !== undefined) queryParams.append("on_sale", String(params.on_sale));
      if (params?.search) queryParams.append("search", params.search);
      
      const url = `/shop/variants/${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await apiCall(url);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get variants");
    }
  }
);

export const getProductVariant = createAsyncThunk(
  "shop/getProductVariant",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/shop/variants/${id}/`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get variant");
    }
  }
);

export const createProductVariant = createAsyncThunk(
  "shop/createProductVariant",
  async (data: Omit<ProductVariant, "id" | "created_at" | "updated_at" | "final_price">, { rejectWithValue }) => {
    try {
      const response = await apiCall("/shop/variants/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create variant");
    }
  }
);

export const updateProductVariant = createAsyncThunk(
  "shop/updateProductVariant",
  async ({ id, data }: { id: number; data: Partial<ProductVariant> }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/shop/variants/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update variant");
    }
  }
);

export const deleteProductVariant = createAsyncThunk(
  "shop/deleteProductVariant",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiCall(`/shop/variants/${id}/`, {
        method: "DELETE",
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete variant");
    }
  }
);

// Async Thunks - Inventory
export const getInventory = createAsyncThunk(
  "shop/getInventory",
  async (variantId: number, { rejectWithValue }) => {
    try {
      const url = variantId ? `/shop/inventory/?variant=${variantId}` : "/shop/inventory/";
      const response = await apiCall(url);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get inventory");
    }
  }
);

export const updateInventory = createAsyncThunk(
  "shop/updateInventory",
  async ({ id, quantity }: { id: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await apiCall(`/shop/inventory/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update inventory");
    }
  }
);

// Slice
const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCategory.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((cat) => cat.slug === action.payload.slug);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat.slug !== action.payload);
      });

    // Products
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.products = action.payload;
        } else {
          state.products = action.payload.results || [];
          state.pagination = {
            count: action.payload.count || 0,
            next: action.payload.next || null,
            previous: action.payload.previous || null,
          };
        }
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.slug === action.payload.slug);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.slug === action.payload.slug) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.slug !== action.payload);
      })
      .addCase(getFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Product Variants
    builder
      .addCase(getProductVariants.fulfilled, (state, action) => {
        state.productVariants = action.payload;
      })
      .addCase(createProductVariant.fulfilled, (state, action) => {
        state.productVariants.push(action.payload);
      })
      .addCase(updateProductVariant.fulfilled, (state, action) => {
        const index = state.productVariants.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.productVariants[index] = action.payload;
        }
      })
      .addCase(deleteProductVariant.fulfilled, (state, action) => {
        state.productVariants = state.productVariants.filter((v) => v.id !== action.payload);
      });

    // Inventory
    builder
      .addCase(getInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.inventory.findIndex((inv) => inv.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentProduct, setCurrentCategory, clearProducts } = shopSlice.actions;
export default shopSlice.reducer;

