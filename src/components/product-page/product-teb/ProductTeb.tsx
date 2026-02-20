import React, { useEffect, useState, useCallback } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Fade } from "react-awesome-reveal";
import RatingComponent from "@/components/stars/RatingCompoents";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Form } from "react-bootstrap";
import { apiCall } from "@/utils/api";
import { showSuccessToast, showErrorToast } from "@/components/toast-popup/Toastify";
import Spinner from "@/components/button/Spinner";

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postCode: string;
  country: string;
  state: string;
  profilePhoto?: string;
  description: string;
}

const getRegistrationData = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("registrationData");
    return data ? JSON.parse(data) : null;
  }
  return null;
};

const ProductTeb = () => {
  const dispatch = useDispatch<AppDispatch>();
  const login = useSelector(
    (state: RootState) => state.user?.isAuthenticated ?? false
  );
  const user = useSelector((state: RootState) => state.user?.user);
  const { currentProduct } = useSelector((state: RootState) => state.shop);
  
  const [userData, setUserData] = useState<any | null>(null);
  const [validated, setValidated] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (login && user) {
      setUserData({
        firstName: user.full_name?.split(' ')[0] || '',
        lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        profilePhoto: user.avatar_url || user.avatar || null,
      });
    }
  }, [login, user]);

  // Fetch reviews function - memoized to prevent unnecessary re-renders
  const fetchReviews = useCallback(async () => {
    if (!currentProduct?.id) return;
    
    setLoading(true);
    try {
      const response = await apiCall(`/shop/ratings/?product=${currentProduct.id}`);
      setReviews(Array.isArray(response) ? response : response.results || []);
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      showErrorToast("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [currentProduct?.id]);

  // Fetch reviews when product changes
  useEffect(() => {
    if (currentProduct?.id) {
      fetchReviews();
    }
  }, [currentProduct?.id, fetchReviews]);

  const handleProductClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!currentProduct?.id) {
      showErrorToast("Product not found");
      return;
    }

    if (!rating || rating < 1) {
      showErrorToast("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      showErrorToast("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        product: currentProduct.id,
        rating,
        review: comment.trim(),
      };

      // Create new review
      await apiCall("/shop/ratings/", {
        method: "POST",
        body: JSON.stringify(reviewData),
      });
      showSuccessToast("Review submitted successfully!");

      // Refresh reviews
      await fetchReviews();
      setComment("");
      setRating(0);
      setValidated(false);
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      showErrorToast(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await apiCall(`/shop/ratings/${reviewId}/`, {
        method: "DELETE",
      });
      showSuccessToast("Review deleted successfully!");
      await fetchReviews();
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      showErrorToast(error.message || "Failed to delete review");
    }
  };
  return (
    <>
      <Tabs
        selectedIndex={selectedIndex}
        onSelect={(selectedIndex) => setSelectedIndex(selectedIndex)}
        className="gi-single-pro-tab"
      >
        <div className="gi-single-pro-tab-wrapper">
          <TabList className="gi-single-pro-tab-nav">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <Tab className="nav-item" role="presentation" key={"details"}>
                <button
                  className={`nav-link ${selectedIndex == 0 ? "active" : ""}`}
                  id="details-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#gi-spt-nav-details"
                  type="button"
                  role="tab"
                  aria-controls="gi-spt-nav-details"
                  aria-selected="true"
                  onClick={() => handleProductClick(0)}
                >
                  Detail
                </button>
              </Tab>
              {/* <Tab className="nav-item" role="presentation" key={"info"}>
                <button
                  className={`nav-link ${selectedIndex == 1 ? "active" : ""}`}
                  id="info-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#gi-spt-nav-info"
                  type="button"
                  role="tab"
                  aria-controls="gi-spt-nav-info"
                  aria-selected="false"
                  onClick={() => handleProductClick(1)}
                >
                  Specifications
                </button>
              </Tab> */}
              {/* <Tab className="nav-item" role="presentation" key={"vendor"}>
                <button
                  className={`nav-link ${selectedIndex == 2 ? "active" : ""}`}
                  onClick={() => handleProductClick(2)}
                  id="vendor-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#gi-spt-nav-vendor"
                  type="button"
                  role="tab"
                  aria-controls="gi-spt-nav-vendor"
                  aria-selected="false"
                >
                  Vendor
                </button>
              </Tab> */}
              <Tab className="nav-item" role="presentation" key={"review"}>
                <button
                  className={`nav-link ${selectedIndex == 1 ? "active" : ""}`}
                  onClick={() => handleProductClick(1)}
                  id="review-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#gi-spt-nav-review"
                  type="button"
                  role="tab"
                  aria-controls="gi-spt-nav-review"
                  aria-selected="false"
                >
                  Reviews
                </button>
              </Tab>
            </ul>
          </TabList>
          <div className="tab-content  gi-single-pro-tab-content">
            <TabPanel>
              <Fade
                duration={1000}
                className={`tab-pane fade ${
                  selectedIndex === 0 ? "show active" : ""
                }`}
              >
                <div className="gi-single-pro-tab-desc">
                  {currentProduct?.description ? <p dangerouslySetInnerHTML={{ __html: currentProduct?.description }}></p> : <p>No description available.</p>}
                  
                </div>
              </Fade>
            </TabPanel>
            {/* <TabPanel>
              <Fade
              duration={1000}
              className={`tab-pane fade ${
                selectedIndex === 1 ? "show active" : ""
              }`}
            >
              <div className="gi-single-pro-tab-moreinfo">
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry`s
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries.
                </p>
                <ul>
                  <li>
                    <span>Model</span> SKU140
                  </li>
                  <li>
                    <span>Weight</span> 500 g
                  </li>
                  <li>
                    <span>Dimensions</span> 35 × 30 × 7 cm
                  </li>
                  <li>
                    <span>Color</span> Black, Pink, Red, White
                  </li>
                  <li>
                    <span>Size</span> 10 X 20
                  </li>
                </ul>
              </div>
            </Fade>
            <Fade
              duration={1000}
              className={`tab-pane fade ${
                selectedIndex === 2 ? "show active" : ""
              }`}
            >
              <div className="gi-single-pro-tab-moreinfo">
                <div className="gi-product-vendor">
                  <div className="gi-vendor-info">
                    <span>
                      <img
                        src={
                          process.env.NEXT_PUBLIC_URL +
                          "/assets/img/vendor/3.jpg"
                        }
                        alt="vendor"
                      />
                    </span>
                    <div>
                      <h5>Ocean Crate</h5>
                      <p>Products : 358</p>
                      <p>Sales : 5587</p>
                    </div>
                  </div>
                  <div className="gi-detail">
                    <ul>
                      <li>
                        <span>Phone No. :</span> +00 987654321
                      </li>
                      <li>
                        <span>Email. :</span> Example@gmail.com
                      </li>
                      <li>
                        <span>Address. :</span> 2548 Broaddus Maple Court,
                        Madisonville KY 4783, USA.
                      </li>
                    </ul>
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry `
                      s standard dummy text ever since the 1500s, when an
                      unknown printer took a galley of type and scrambled it to
                      make a type specimen book. It has survived not only five
                      centuries, but also the leap into electronic typesetting,
                      remaining essentially unchanged.
                    </p>
                  </div>
                </div>
              </div>
            </Fade> */}
            <TabPanel>
              <Fade
                duration={1000}
                className={`tab-pane fade ${
                  selectedIndex === 1 ? "show active" : ""
                }`}
              >
                {!login ? (
                <div className="container">
                  <p>
                    Please <a href="/login">login</a> or{" "}
                    <a href="/register">register</a> to review the product.
                  </p>
                </div>
              ) : (
                <div className="row">
                  <div className="gi-t-review-wrapper">
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    ) : (
                      reviews.map((data) => {
                        const reviewUserId = typeof data.user === 'object' ? data.user?.id : data.user;
                        const isStaff = user?.is_staff || false;
                        const canDelete = isStaff;
                        const userName = data.user_name || data.user_email || "Anonymous";
                        const userAvatar = data.user?.avatar_url || data.user?.avatar || 
                          user?.avatar_url || user?.avatar || 
                          process.env.NEXT_PUBLIC_URL + "/assets/img/avatar/placeholder.jpg";
                        
                        return (
                          <div key={data.id} className="gi-t-review-item">
                            <div className="gi-t-review-avtar">
                              <img
                                src={userAvatar}
                                alt="user"
                              />
                            </div>
                            <div className="gi-t-review-content">
                              <div className="gi-t-review-top">
                                <div className="gi-t-review-name">
                                  {userName}
                                  {data.is_verified_purchase && (
                                    <span style={{ 
                                      marginLeft: "8px", 
                                      fontSize: "12px", 
                                      color: "#5caf90",
                                      fontWeight: "bold"
                                    }}>
                                      ✓ Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <div className="gi-t-review-rating">
                                  {[...Array(5)].map((_, i) => (
                                    <i
                                      key={i}
                                      className={`gicon gi-star ${
                                        i < data.rating ? "fill" : "gi-star-o"
                                      }`}
                                    ></i>
                                  ))}
                                </div>
                              </div>
                              <div className="gi-t-review-bottom">
                                <p>{data.review || data.comment}</p>
                                <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                                  {new Date(data.created).toLocaleDateString()}
                                </div>
                              </div>
                              {canDelete && (
                                <div style={{ marginTop: "10px" }}>
                                  <button
                                    onClick={() => handleDelete(data.id)}
                                    style={{
                                      background: "none",
                                      border: "1px solid #dc3545",
                                      color: "#dc3545",
                                      padding: "5px 15px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "12px"
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="gi-ratting-content">
                    <h3>Add a Review</h3>
                    <div className="gi-ratting-form">
                      <Form
                        noValidate
                        validated={validated}
                        onSubmit={handleSubmit}
                        action="#"
                      >
                        <div className="gi-ratting-star">
                          <RatingComponent
                            onChange={setRating}
                            value={rating}
                          />
                        </div>
                        <div className="gi-ratting-input form-submit">
                          <Form.Group>
                            <Form.Control
                              as="textarea"
                              name="comment"
                              placeholder="Enter Your Comment"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              required
                              disabled={submitting}
                            />
                            <Form.Control.Feedback type="invalid">
                              Please Enter your reply
                            </Form.Control.Feedback>
                          </Form.Group>
                          <button
                            style={{ marginTop: "15px" }}
                            className="gi-btn-2"
                            type="submit"
                            disabled={submitting || !rating || !comment.trim()}
                          >
                            {submitting ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </Form>
                    </div>
                  </div>
                </div>
                )}
              </Fade>
            </TabPanel>
          </div>
        </div>
      </Tabs>
    </>
  );
};

export default ProductTeb;
