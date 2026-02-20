"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getBlogs } from "@/store/reducers/blogSlice";
import Spinner from "@/components/button/Spinner";
import Link from "next/link";

const RecentBlog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    // Fetch recent blogs (limit to 5, ordered by published_at)
    // Only fetch if not already loading and blogs haven't been loaded
    if (!loading && blogs.length === 0) {
      dispatch(getBlogs({ limit: 5, ordering: "-published_at" }));
    }
  }, [dispatch, loading, blogs.length]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get first image or placeholder
  const getImageUrl = (blog: any) => {
    if (blog.images && blog.images.length > 0 && blog.images[0].image_url) {
      return blog.images[0].image_url;
    }
    return process.env.NEXT_PUBLIC_URL + "/assets/img/blog/placeholder.jpg";
  };

  // Get category name
  const getCategory = (blog: any) => {
    if (blog.category && blog.category.name) {
      return blog.category.name;
    }
    return "Uncategorized";
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-muted" style={{ padding: "20px", color: "#dc3545" }}>
        Error loading blogs: {error}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-muted" style={{ padding: "20px" }}>
        No recent articles found.
      </div>
    );
  }

  return (
    <>
      {blogs.slice(0, 5).map((blog: any) => (
        <div key={blog.id} className="gi-sidebar-block-item">
          <div className="gi-sidebar-block-img">
            <Link href={`/blog-details/${blog.slug}`}>
              <img 
                src={getImageUrl(blog)} 
                alt={blog.title || "blog image"}
                style={{ borderRadius: '8px', width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            </Link>
          </div>
          <div className="gi-sidebar-block-detial">
            <h5 className="gi-blog-title">
              <Link href={`/blog-details/${blog.slug}`}>
                {blog.title}
              </Link>
            </h5>
            <div className="gi-blog-date">
              {formatDate(blog.published_at || blog.created)}
            </div>
            {blog.category ? (
              <Link href={`/blogs?category=${blog.category.slug}`}>
                {getCategory(blog)}
              </Link>
            ) : (
              <span>Uncategorized</span>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default RecentBlog;
