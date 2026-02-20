import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiCall } from "@/utils/api";

// Types
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  blog_count?: number;
  created: string;
  last_modified: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  blog_count?: number;
  created: string;
  last_modified: string;
}

export interface BlogImage {
  id: number;
  blog: number;
  image: string;
  image_url?: string;
  is_active: boolean;
  alt_text: string;
  ordering: number;
  created: string;
  last_modified: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  author: number;
  author_name: string;
  author_email?: string;
  category?: BlogCategory | null;
  featured_video?: string;
  tags: BlogTag[];
  images: BlogImage[];
  excerpt: string;
  content: string;
  status: "draft" | "published";
  is_active: boolean;
  published_at: string | null;
  view_count: number;
  reading_time: number;
  created: string;
  last_modified: string;
}

export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  featuredBlogs: Blog[];
  tags: BlogTag[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  featuredBlogs: [],
  tags: [],
  categories: [],
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Async Thunks
export const getBlogs = createAsyncThunk(
  "blog/getBlogs",
  async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    tags?: number[];
    ordering?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) queryParams.append("search", params.search);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("page_size", params.limit.toString());
      if (params?.tags && params.tags.length > 0) {
        params.tags.forEach((tag) => queryParams.append("tags__id", tag.toString()));
      }
      if (params?.ordering) queryParams.append("ordering", params.ordering);

      const url = `/blogs/posts/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiCall(url, { method: "GET" });
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch blogs");
    }
  }
);

export const getBlogBySlug = createAsyncThunk(
  "blog/getBlogBySlug",
  async (slug: string) => {
    try {
      if (!slug || slug.trim() === '') {
        throw new Error("Slug is required");
      }
      
      const cleanSlug = slug.trim();
      const url = `/blogs/posts/${encodeURIComponent(cleanSlug)}/`;
      const response = await apiCall(url, { method: "GET" });
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch blog");
    }
  }
);

export const getFeaturedBlogs = createAsyncThunk(
  "blog/getFeaturedBlogs",
  async () => {
    try {
      const response = await apiCall("/blogs/posts/featured/", { method: "GET" });
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch featured blogs");
    }
  }
);

export const getBlogTags = createAsyncThunk("blog/getBlogTags", async () => {
  try {
    const response = await apiCall("/blogs/tags/", { method: "GET" });
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch blog tags");
  }
});

export const getBlogCategories = createAsyncThunk("blog/getBlogCategories", async () => {
  try {
    const response = await apiCall("/blogs/categories/", { method: "GET" });
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch blog categories");
  }
});

// Slice
const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Blogs
    builder
      .addCase(getBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogs.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.blogs = action.payload;
        } else if (action.payload.results) {
          // Paginated response
          state.blogs = action.payload.results;
          state.pagination = {
            count: action.payload.count || 0,
            next: action.payload.next || null,
            previous: action.payload.previous || null,
          };
        } else {
          state.blogs = [];
        }
      })
      .addCase(getBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch blogs";
      });

    // Get Blog By Slug
    builder
      .addCase(getBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogBySlug.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(getBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch blog";
      });

    // Get Featured Blogs
    builder
      .addCase(getFeaturedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeaturedBlogs.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.featuredBlogs = action.payload;
        } else if (action.payload.results) {
          state.featuredBlogs = action.payload.results;
        } else {
          state.featuredBlogs = [];
        }
      })
      .addCase(getFeaturedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch featured blogs";
      });

    // Get Blog Tags
    builder
      .addCase(getBlogTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogTags.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.tags = action.payload;
        } else if (action.payload.results) {
          state.tags = action.payload.results;
        } else {
          state.tags = [];
        }
      })
      .addCase(getBlogTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch blog tags";
      });

    // Get Blog Categories
    builder
      .addCase(getBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogCategories.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.categories = action.payload;
        } else if (action.payload.results) {
          state.categories = action.payload.results;
        } else {
          state.categories = [];
        }
      })
      .addCase(getBlogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch blog categories";
      });
  },
});

export const { clearCurrentBlog, clearError } = blogSlice.actions;
export default blogSlice.reducer;
