"use client";
import React, { useEffect, useMemo, useState } from "react";
import BlogContent from "./blog-content/BlogContent";
import RecentBlog from "./blog-sidebar-area/RecentBlog";
import BlogCategories from "./blog-sidebar-area/BlogCategories";
import { Col } from "react-bootstrap";
import Paginantion from "../paginantion/Paginantion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setSearchTerm } from "@/store/reducers/filterReducer";
import { getBlogs } from "@/store/reducers/blogSlice";
import Spinner from "../button/Spinner";

const BlogPage = ({ order = "", lg = 12, md }: any) => {
  const dispatch = useDispatch();
  const { selectedCategory, searchTerm } = useSelector(
    (state: RootState) => state.filter
  );
  const { blogs, loading, error, pagination } = useSelector(
    (state: RootState) => state.blog
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchTerm || "");
  const itemsPerPage = 6;

  useEffect(() => {
    console.log("currentPage", currentPage);
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      ordering: "-published_at",
    };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (selectedCategory && selectedCategory.length > 0) {
      // selectedCategory contains category IDs
      // Use the first category ID for filtering (backend supports single category filter)
      if (selectedCategory[0]) {
        params.category = selectedCategory[0];
      }
    }
    
    dispatch(getBlogs(params) as any);
  }, [dispatch]);

  const handleSearch = (event: any) => {
    setSearchInput(event.target.value);
  };

  const handleSubmit = () => {
    dispatch(setSearchTerm(searchInput));
    setCurrentPage(1);
  };

  useEffect(() => {
    setSearchInput(searchTerm || "");
  }, [searchTerm]);

  const getPageData = () => {
    return blogs || [];
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil((pagination.count || blogs.length) / itemsPerPage);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <Col lg={lg} md={12} className={`gi-blogs-rightside ${order}`}>
        {loading ? (
          <div className="blogpage-message blogpage-message--loading">
            <Spinner />
            <p className="blogpage-message__text">Fetching posts...</p>
          </div>
        ) : error ? (
          <div className="blogpage-message blogpage-message--error">
            <div className="blogpage-message__icon">
              <i className="fi-rr-info" aria-hidden />
            </div>
            <h3 className="blogpage-message__title">Oops, we hit a snag</h3>
            <p className="blogpage-message__text">
              Posts didn&apos;t load — maybe check your connection? Hit the button below and we&apos;ll try again.
            </p>
            <button
              type="button"
              className="blogpage-message__retry"
              onClick={() => {
                const params: any = { page: currentPage, limit: itemsPerPage, ordering: "-published_at" };
                if (searchTerm) params.search = searchTerm;
                if (selectedCategory?.[0]) params.category = selectedCategory[0];
                dispatch(getBlogs(params) as any);
              }}
            >
              <i className="fi-rr-refresh" /> Give it another shot
            </button>
          </div>
        ) : (
          <>
            {/* <!-- Blog content Start --> */}
            <div className="gi-blogs-content">
              <div className="gi-blogs-inner">
                <div className="row">
                  {getPageData().map((item: any, index: number) => (
                    <BlogContent data={item} key={item.id || index} md={md} />
                  ))}
                </div>
              </div>
            </div>
            {/* <!-- Blog content end --> */}

            {/* <!-- Pagination Start --> */}
            {blogs.length === 0 ? (
              <div className="blogpage-message blogpage-message--empty">
                <div className="blogpage-message__icon">
                  <i className="fi-rr-document" aria-hidden />
                </div>
                <p className="blogpage-message__text">No posts yet — try a different search or check back later.</p>
              </div>
            ) : (
              <div className="gi-pro-pagination">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, pagination.count || blogs.length)} of{" "}
                  {pagination.count || blogs.length} item(s)
                </span>
                <Paginantion
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
            {/* <!-- Pagination End --> */}
          </>
        )}
      </Col>
      <style jsx>{`
        .blogpage-message {
          text-align: center;
          padding: 2rem 1.25rem;
          border-radius: 16px;
          margin-top: 0.5rem;
          background: #f8f6f3;
          border: 1px solid #e8e4de;
        }
        .blogpage-message--loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 2.5rem 1.5rem;
        }
        .blogpage-message--loading .blogpage-message__text {
          color: #6b6b6b;
          font-size: 0.95rem;
          margin: 0;
        }
        .blogpage-message__icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 0.75rem;
          border-radius: 50%;
          background: #eee9e2;
          color: #8b7355;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .blogpage-message--empty .blogpage-message__icon {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        }
        .blogpage-message__title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #4a4a4a;
          margin-bottom: 0.35rem;
        }
        .blogpage-message__text {
          color: #6b6b6b;
          margin-bottom: 1rem;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .blogpage-message--empty .blogpage-message__text {
          margin-bottom: 0;
        }
        .blogpage-message__retry {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: #03492f;
          color: #fff;
          border: none;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .blogpage-message__retry:hover {
          background: #023020;
          transform: scale(1.02);
        }
      `}</style>

      {/* <!-- Sidebar Area Start --> */}
      <Col
        lg={4}
        md={12}
        className={`gi-blogs-sidebar gi-blogs-leftside m-t-991 ${(order = -1)}`}
      >
        {/* <div className="gi-blog-search">
          <div className="gi-blog-search-form">
            <input
              style={{ boxShadow: "none" }}
              className="form-control"
              placeholder="Search Our Blog"
              type="text"
              value={searchInput}
              onChange={handleSearch}
              onKeyDown={handleKeyPress}
            />

            <button onClick={handleSubmit} className="submit" type="button">
              <i className="gicon gi-search"></i>
            </button>
          </div>
        </div> */}
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

export default BlogPage;
