"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Col, Form, InputGroup } from "react-bootstrap";
import * as formik from "formik";
import * as yup from "yup";
import CommentReplyingForm from "./CommentReplyingForm";
import BlogCategories from "../blog-sidebar/blog-sidebar-area/BlogCategories";
import RecentBlog from "../blog-sidebar/blog-sidebar-area/RecentBlog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { setSearchTerm } from "@/store/reducers/filterReducer";
import { getBlogBySlug, clearCurrentBlog } from "@/store/reducers/blogSlice";
import Spinner from "../button/Spinner";
import Link from "next/link";

const getRegistrationData = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("registrationData");
    return data ? JSON.parse(data) : null;
  }
  return null;
};

const BlogDetail = ({ slug, order = "" }: any) => {
  const { Formik } = formik;
  const formikRef = useRef<any>(null);
  const schema = yup.object().shape({
    comment: yup.string().required(),
  });

  useEffect(() => {
    console.log('slug', slug);
  }, [slug]);

  const login = useSelector(
    (state: RootState) => state.registration.isAuthenticated
  );

  const { selectedCategory, searchTerm } = useSelector(
    (state: RootState) => state.filter
  );
  
  const { currentBlog, loading, error } = useSelector(
    (state: RootState) => state.blog
  );

  const [userData, setUserData] = useState<any | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState<any>(searchTerm || "");
  const [comments, setComments] = useState<any>([]);

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState({
    reply: "",
  });

  useEffect(() => {
    const data = getRegistrationData();
    if (data?.length > 0) {
      setUserData(data[data.length - 1]);
    }
  }, []);

  useEffect(() => {
    console.log('slug', slug);
    if (slug) {
      console.log('Fetching blog with slug:', slug);
      dispatch(getBlogBySlug(slug) as any);
    }
    // return () => {
    //   dispatch(clearCurrentBlog());
    // };
  }, [dispatch, slug]);

  useEffect(() => {
    if (error) {
      console.error('Blog fetch error:', error);
    }
  }, [error]);

  const handleSearch = (event: any) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    dispatch(setSearchTerm(searchInput));
    router.push("/blogs");
  };

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

  if (loading) {
    return (
      <Col lg={8} md={12} className={`gi-blogs-rightside ${order}`}>
        <Spinner />
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={8} md={12} className={`gi-blogs-rightside ${order}`}>
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
      <Col lg={8} md={12} className={`gi-blogs-rightside ${order}`}>
        <div className="gi-pro-content cart-pro-title">
          <p>Blog not found</p>
          <p>Slug used: {slug}</p>
        </div>
      </Col>
    );
  }

  if (!currentBlog) {
    return (
      <Col lg={8} md={12} className={`gi-blogs-rightside ${order}`}>
        <Spinner />
      </Col>
    );
  }

  const onSubmit = (data: any) => {
    const date = new Date().toLocaleDateString();
    setComments((prevComments: any) => [
      ...prevComments,
      {
        ...data,
        date,
        profilePhoto: userData?.profilePhoto || "",
        name: userData?.firstName || "",
        lname: userData?.lastName || "",
        email: userData?.email || "",
        replies: [],
      },
    ]);

    // Reset form after successful submission
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
  };

  const onReplySubmit = (data: any, index: number) => {
    const date = new Date().toLocaleDateString();
    setComments((prevComments) => {
      const updatedComments = [...prevComments];
      updatedComments[index] = {
        ...updatedComments[index],
        replies: [
          ...updatedComments[index].replies,
          {
            ...data,
            date,
            profilePhoto: userData?.profilePhoto || "",
            name: userData?.firstName || "",
            lname: userData?.lastName || "",
            email: userData?.email || "",
          },
        ],
      };
      return updatedComments;
    });

    setReplyingTo(null);
  };

  const handleReplyClick = (index: number) => {
    setReplyingTo(index);
  };

  return (
    <>
      <Col lg={8} md={12} className={`gi-blogs-rightside ${order} `}>
        {/* <!-- Blog content Start --> */}
        <div className="gi-blogs-content">
          <div className="gi-blogs-inner">
            <div className="gi-single-blog-item">
              <div className="single-blog-info">
                {currentBlog.images && currentBlog.images.length > 0 && currentBlog.images[0].image_url && (
                  <figure className="blog-img">
                    <img
                      src={currentBlog.images[0].image_url}
                      alt={currentBlog.images[0].alt_text || currentBlog.title}
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxHeight: '500px',
                        objectFit: 'contain',
                        borderRadius: '16px',
                        display: 'block'
                      }}
                    />
                  </figure>
                )}
                <div className="single-blog-detail">
                  <label>
                    {formatDate(currentBlog.published_at || currentBlog.created)} -{" "}
                    {currentBlog.category ? (
                      <Link href={`/blogs?category=${getCategorySlug()}`}>
                        {getCategory()}
                      </Link>
                    ) : (
                      "Uncategorized"
                    )}
                  </label>
                  <h3>{currentBlog.title || "Untitled Blog Post"}</h3>
                  {currentBlog.excerpt && (
                    <p className="gi-text-highlight">{currentBlog.excerpt}</p>
                  )}
                  {currentBlog.content ? (
                    <div 
                      className="gi-text"
                      dangerouslySetInnerHTML={{ 
                        __html: currentBlog.content.replace(/\n/g, '<br />') 
                      }}
                    />
                  ) : (
                    <p className="gi-text">No content available for this blog post.</p>
                  )}
                  {/* Extra images at the end of content */}
                  {currentBlog.images && currentBlog.images.length > 1 && (
                    <div className="sub-img mt-4 mb-4">
                      <div className="row">
                        {currentBlog.images.slice(1, 3).map((img: any, index: number) => (
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
                                height: 'auto', 
                                maxHeight: '400px',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentBlog.category && (
                    <div className="blog-category mt-4">
                      <strong>Category: </strong>
                      <Link href={`/blogs?category=${getCategorySlug()}`}>
                        <span className="badge bg-primary">{getCategory()}</span>
                      </Link>
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
                  <div className="blog-meta mt-4 pt-3 border-top">
                    <small className="text-muted">
                      <strong>Author:</strong> {currentBlog.author_name || "Admin"} | 
                      <strong> Reading time:</strong> {currentBlog.reading_time || 1} min | 
                      <strong> Views:</strong> {currentBlog.view_count || 0}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- Comments Start -->  */}

          {/* <div className="gi-blog-comments m-t-80">
            {!login ? (
              <div className="container">
                <p>
                  Please <a href="/login">login</a> or{" "}
                  <a href="/register">register</a> to review the blog comments.
                </p>
              </div>
            ) : (
              <>
                <div className="gi-blog-cmt-preview">
                  <div className="gi-blog-comment-wrapper">
                    <h4 className="gi-blog-dgi-title">
                      Comments : {comments.length}
                    </h4>
                    {comments.map((data: any, index: number) => (
                      <div key={index}>
                        <div className="gi-single-comment-wrapper mt-35">
                          <div className="gi-blog-user-img">
                            <img
                              src={
                                data.profilePhoto ||
                                process.env.NEXT_PUBLIC_URL +
                                  "/assets/img/avatar/placeholder.jpg"
                              }
                              alt="blog image"
                            />
                          </div>
                          <div className="gi-blog-comment-content">
                            <h5>
                              {data.name} {data.lname}
                            </h5>
                            <span>{data.date} </span>
                            <p>{data.comment} </p>

                            {replyingTo === index ? (
                              <div className="gi-blog-cmt-form">
                                <div className="gi-blog-reply-wrapper mt-50">
                                  <CommentReplyingForm
                                    index={index}
                                    onFormSubmit={onReplySubmit}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="gi-blog-details-btn">
                                <a onClick={() => handleReplyClick(index)}>
                                  Reply
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        {data.replies.map((reply: any, replyIndex: number) => (
                          <div
                            key={replyIndex}
                            className="gi-single-comment-wrapper sub-cmt"
                          >
                            <div className="gi-blog-user-img">
                              <img
                                src={
                                  reply.profilePhoto ||
                                  process.env.NEXT_PUBLIC_URL +
                                    "/assets/img/avatar/placeholder.jpg"
                                }
                                alt="blog image"
                              />
                            </div>
                            <div className="gi-blog-comment-content">
                              <h5>
                                {reply.name} {reply.lname}
                              </h5>
                              <span>{reply.date}</span>
                              <p>{reply.reply}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="gi-blog-cmt-form">
                  <div className="gi-blog-reply-wrapper mt-50">
                    <h4 className="gi-blog-dgi-title">Leave A Reply</h4>

                    <Formik
                      innerRef={formikRef}
                      validationSchema={schema}
                      onSubmit={onSubmit}
                      initialValues={{
                        comment: "",
                      }}
                    >
                      {({
                        handleSubmit,
                        handleChange,
                        values,
                        touched,
                        errors,
                      }) => (
                        <Form
                          noValidate
                          onSubmit={handleSubmit}
                          className={`gi-blog-form ${
                            errors.length ? "was-validated" : ""
                          }`}
                          action="#"
                        >
                          <div className="row">
                            <div className="col-md-12">
                              <div className="gi-text-leave">
                                <Form.Group>
                                  <InputGroup hasValidation>
                                    <Form.Control
                                      as="textarea"
                                      name="comment"
                                      value={values.comment}
                                      onChange={handleChange}
                                      placeholder="Message"
                                      rows={3}
                                      required
                                      isInvalid={!!errors.comment}
                                    />
                                    <Form.Control.Feedback
                                      style={{ marginBottom: "10px" }}
                                      type="invalid"
                                    >
                                      Please enter comment
                                    </Form.Control.Feedback>
                                  </InputGroup>
                                </Form.Group>
                                <button type="submit" className="gi-btn-2 mt-4">
                                  Submit
                                </button>
                              </div>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </>
            )}
          </div> */}

          {/* <!-- Comments End --> */}
        </div>
        {/* <!--Blog content End --> */}
      </Col>
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
            />
            <button
              onClick={handleSearchSubmit}
              className="submit"
              type="button"
            >
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

export default BlogDetail;
