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
      <div className="recentblog-message recentblog-message--loading">
        <Spinner />
        <p className="recentblog-message__text">Fetching recent articles...</p>
        <style jsx>{`
          .recentblog-message--loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1.25rem 1rem;
            background: #f8f6f3;
            border-radius: 12px;
            border: 1px solid #e8e4de;
          }
          .recentblog-message--loading .recentblog-message__text {
            color: #6b6b6b;
            font-size: 0.875rem;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recentblog-message recentblog-message--error">
        <div className="recentblog-message__icon">
          <i className="fi-rr-info" aria-hidden />
        </div>
        <p className="recentblog-message__text">Couldn&apos;t load recent articles. Give it another shot?</p>
        <button
          type="button"
          className="recentblog-message__retry"
          onClick={() => dispatch(getBlogs({ limit: 5, ordering: "-published_at" }))}
        >
          <i className="fi-rr-refresh" /> Try again
        </button>
        <style jsx>{`
          .recentblog-message {
            text-align: center;
            padding: 1.25rem 1rem;
            border-radius: 12px;
            background: #f8f6f3;
            border: 1px solid #e8e4de;
          }
          .recentblog-message__icon {
            width: 40px;
            height: 40px;
            margin: 0 auto 0.5rem;
            border-radius: 50%;
            background: #eee9e2;
            color: #8b7355;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
          }
          .recentblog-message__text {
            color: #6b6b6b;
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            line-height: 1.4;
          }
          .recentblog-message__retry {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.4rem 0.75rem;
            background: #03492f;
            color: #fff;
            border: none;
            border-radius: 999px;
            font-weight: 600;
            font-size: 0.8rem;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
          }
          .recentblog-message__retry:hover {
            background: #023020;
            transform: scale(1.02);
          }
        `}</style>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="recentblog-message recentblog-message--empty">
        <div className="recentblog-message__icon">
          <i className="fi-rr-document" aria-hidden />
        </div>
        <p className="recentblog-message__text">No recent articles yet — check back soon.</p>
        <style jsx>{`
          .recentblog-message--empty {
            text-align: center;
            padding: 1.25rem 1rem;
            background: #f8f6f3;
            border-radius: 12px;
            border: 1px solid #e8e4de;
          }
          .recentblog-message--empty .recentblog-message__icon {
            width: 36px;
            height: 36px;
            margin: 0 auto 0.5rem;
            border-radius: 50%;
            background: #eee9e2;
            color: #8b7355;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
          }
          .recentblog-message--empty .recentblog-message__text {
            color: #6b6b6b;
            font-size: 0.875rem;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {blogs.slice(0, 5).map((blog: any) => (
        <div key={blog.id} className="gi-sidebar-block-item">
          <div
            className="gi-sidebar-block-img"
            style={{
              width: "72px",
              minWidth: "72px",
              height: "72px",
              minHeight: "72px",
              overflow: "hidden",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <Link href={`/blog-details/${blog.slug}`} style={{ display: "block", height: "100%" }}>
              <img
                src={getImageUrl(blog)}
                alt={blog.title || "blog image"}
                style={{
                  borderRadius: "8px",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
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
