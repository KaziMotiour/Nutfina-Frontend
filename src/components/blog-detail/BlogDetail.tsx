"use client";
import { useEffect } from "react";
import { Col } from "react-bootstrap";
import BlogCategories from "../blog-sidebar/blog-sidebar-area/BlogCategories";
import RecentBlog from "../blog-sidebar/blog-sidebar-area/RecentBlog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { getBlogBySlug } from "@/store/reducers/blogSlice";
import Spinner from "../button/Spinner";
import Link from "next/link";

const BlogDetail = ({ slug }: any) => {
  const { selectedCategory, searchTerm } = useSelector(
    (state: RootState) => state.filter
  );
  
  const { currentBlog, loading, error } = useSelector(
    (state: RootState) => state.blog
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (slug) {
      dispatch(getBlogBySlug(slug) as any);
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (error) {
      console.error('Blog fetch error:', error);
    }
  }, [error]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get category name
  const getCategory = () => {
    if (currentBlog?.category && currentBlog.category.name) {
      return currentBlog.category.name;
    }
    return "Uncategorized";
  };

  // Get category slug for filtering
  const getCategorySlug = () => {
    if (currentBlog?.category && currentBlog.category.slug) {
      return currentBlog.category.slug;
    }
    return "";
  };

  const getPrimaryImageUrl = () => {
    if (!currentBlog?.images || currentBlog.images.length === 0) return null;
    return currentBlog.images[0].image_url || currentBlog.images[0].image || null;
  };

  const getAdditionalImages = () => {
    if (!currentBlog?.images || currentBlog.images.length <= 1) return [];
    return currentBlog.images.slice(1, 4);
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    return content
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.trim().length > 0)
      .map((paragraph, index) => (
        <p key={index} className="gi-text" style={{ marginBottom: "18px", lineHeight: 1.85 }}>
          {paragraph}
        </p>
      ));
  };

  if (loading) {
    return (
      <Col lg={8} md={12} className="gi-blogs-rightside">
        <Spinner />
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={8} md={12} className="gi-blogs-rightside">
        <div className="gi-pro-content cart-pro-title">
          <p>Error loading blog: {error}</p>
          <p>Slug used: {slug}</p>
          <p>Please check the console for more details.</p>
        </div>
      </Col>
    );
  }

  if (!loading && !currentBlog) {
    return (
      <Col lg={8} md={12} className="gi-blogs-rightside">
        <div className="gi-pro-content cart-pro-title">
          <p>Blog not found</p>
          <p>Slug used: {slug}</p>
        </div>
      </Col>
    );
  }

  if (!currentBlog) {
    return (
      <Col lg={8} md={12} className="gi-blogs-rightside">
        <Spinner />
      </Col>
    );
  }

  return (
    <>
      <Col lg={8} md={12} className="gi-blogs-rightside order-2 order-lg-2">
        {/* <!-- Blog content Start --> */}
        <div className="gi-blogs-content">
          <div className="gi-blogs-inner">
            <div className="gi-single-blog-item">
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "20px" }}>
            <Link href="/">Home</Link> /{" "}
            <Link href="/blogs">Blog</Link> /{" "}
            <span style={{ color: "#222" }}>{currentBlog.title}</span>
          </div>
  
          {/* Title */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: "20px",
            }}
          >
            {currentBlog.title}
          </h1>
  
          {/* Meta Info */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              fontSize: "14px",
              color: "#777",
              marginBottom: "30px",
            }}
          >
            <span>
              {formatDate(currentBlog.published_at || currentBlog.created)}
            </span>
            <span>•</span>
            <span>{currentBlog.reading_time || 1} min read</span>
            <span>•</span>
            <span>{currentBlog.view_count || 0} views</span>
            {currentBlog.category && (
              <>
                <span>•</span>
                <Link
                  href={`/blogs?category=${getCategorySlug()}`}
                  style={{ color: "#5caf90", fontWeight: 500 }}
                >
                  {getCategory()}
                </Link>
              </>
            )}
          </div>
              <div className="single-blog-info">
                {getPrimaryImageUrl() && (
                  <figure className="blog-img">
                    <img
                      src={getPrimaryImageUrl() as string}
                      alt={currentBlog.images[0]?.alt_text || currentBlog.title}
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxHeight: '520px',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        display: 'block',
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)"
                      }}
                      onError={(e) => {
                        e.currentTarget.src = `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/blog/placeholder.jpg`;
                      }}
                    />
                  </figure>
                )}
                <div className="single-blog-detail">

                  {currentBlog.excerpt && (
                      <div
                        style={{
                          background: "#f5f7f6",
                          padding: "20px",
                          borderRadius: "12px",
                          marginBottom: "35px",
                          marginTop: "20px",
                          fontStyle: "italic",
                          color: "#555",
                          lineHeight: 1.8,
                        }}
                      >
                        {currentBlog.excerpt}
                      </div>
                  )}
                  {currentBlog.content ? (
                    <div>{renderContent(currentBlog.content)}</div>
                  ) : (
                    <p className="gi-text">No content available for this blog post.</p>
                  )}

                  {/* Extra images at the end of content */}
                  {getAdditionalImages().length > 0 && (
                    <div className="sub-img mt-4 mb-4">
                      <h5 style={{ marginBottom: "14px" }}>Gallery</h5>
                      <div className="row">
                        {getAdditionalImages().map((img: any, index: number) => (
                          <div
                            key={img.id || index} 
                            className="col-md-6 mb-3"
                            style={{
                              borderRadius: '16px',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={img.image_url || img.image}
                              alt={img.alt_text || `Blog image ${index + 2}`}
                              style={{ 
                                width: '100%', 
                                height: '260px',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.currentTarget.src = `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/blog/placeholder.jpg`;
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentBlog.tags && currentBlog.tags.length > 0 && (
                    <div className="blog-tags mt-3">
                      <strong>Tags: </strong>
                      {currentBlog.tags.map((tag: any, index: number) => (
                        <span key={tag.id || index} className="badge bg-secondary me-2 mb-2">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* <div className="blog-meta mt-4 pt-3 border-top">
                    <small className="text-muted">
                      <strong>By:</strong> {currentBlog.author_name || "Admin"}{" "}
                      <span style={{ margin: "0 8px" }}>|</span>
                      <strong>Views:</strong> {currentBlog.view_count || 0}
                    </small>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <!--Blog content End --> */}
      </Col>
      <Col
        lg={4}
        md={12}
        className="gi-blogs-sidebar gi-blogs-leftside m-t-991 order-1 order-lg-1"
      >
        <div className="gi-blog-sidebar-wrap">
          {/* <!-- Sidebar Recent Blog Block --> */}
          <div className="gi-sidebar-block gi-sidebar-recent-blog">
            <div className="gi-sb-title">
              <h3 className="gi-sidebar-title">Recent Articles</h3>
            </div>
            <div className="gi-blog-block-content gi-sidebar-dropdown">
              <RecentBlog />
            </div>
          </div>
          {/* <!-- Sidebar Recent Blog Block --> */}
          {/* <!-- Sidebar Category Block --> */}
          <BlogCategories selectedCategory={selectedCategory} />
          {/* <!-- Sidebar Category Block --> */}
        </div>
      </Col>
    </>
  );
};

export default BlogDetail;
